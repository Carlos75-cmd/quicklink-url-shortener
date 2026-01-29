import { NextRequest, NextResponse } from 'next/server'
import { postgresAuthManager } from '@/lib/auth-postgres'
import { persistentAuthManager } from '@/lib/persistent-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let result = null
    let userStats = null

    // Try PostgreSQL first, fallback to file system
    try {
      if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
        result = await postgresAuthManager.login(email, password, ipAddress, userAgent)
        if (result.success) {
          userStats = await postgresAuthManager.getUserStats(result.user!.id)
        }
      } else {
        throw new Error('No database URL, using fallback')
      }
    } catch (dbError) {
      console.log('PostgreSQL not available, using file system fallback')
      // Initialize file system users if needed
      persistentAuthManager.initializeTestUsers()
      result = persistentAuthManager.login(email, password, ipAddress, userAgent)
      if (result && result.success) {
        userStats = persistentAuthManager.getUserStats(result.user!.id)
      }
    }

    if (result && result.success) {
      return NextResponse.json({
        success: true,
        user: result.user,
        sessionId: result.sessionId,
        userStats
      })
    } else {
      return NextResponse.json({ error: result?.error || 'Login failed' }, { status: 401 })
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}