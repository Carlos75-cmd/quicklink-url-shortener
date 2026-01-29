import { NextRequest, NextResponse } from 'next/server'
import { postgresAuthManager } from '@/lib/auth-postgres'
import { persistentAuthManager } from '@/lib/persistent-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    let result
    let loginResult
    let userStats

    // Try PostgreSQL first, fallback to file system
    try {
      if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
        result = await postgresAuthManager.register(email, name, password)
        if (result.success) {
          const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
          const userAgent = request.headers.get('user-agent') || 'unknown'
          loginResult = await postgresAuthManager.login(email, password, ipAddress, userAgent)
          if (loginResult.success) {
            userStats = await postgresAuthManager.getUserStats(loginResult.user!.id)
          }
        }
      } else {
        throw new Error('No database URL, using fallback')
      }
    } catch (dbError) {
      console.log('PostgreSQL not available, using file system fallback')
      result = persistentAuthManager.register(email, name, password)
      if (result.success) {
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const userAgent = request.headers.get('user-agent') || 'unknown'
        loginResult = persistentAuthManager.login(email, password, ipAddress, userAgent)
        if (loginResult.success) {
          userStats = persistentAuthManager.getUserStats(loginResult.user!.id)
        }
      }
    }

    if (result.success && loginResult.success) {
      return NextResponse.json({
        success: true,
        user: loginResult.user,
        sessionId: loginResult.sessionId,
        userStats
      })
    }

    return NextResponse.json({ error: result.error }, { status: 400 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}