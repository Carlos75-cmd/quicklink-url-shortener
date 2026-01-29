import { NextRequest, NextResponse } from 'next/server'
import { postgresAuthManager } from '@/lib/auth-postgres'
import { persistentAuthManager } from '@/lib/persistent-auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Login API called')
    
    const { email, password } = await request.json()
    console.log('Login attempt for:', email)

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    let result = null
    let userStats = null
    let usingDatabase = false

    // Check if we have database URL
    const hasDatabase = !!(process.env.DATABASE_URL || process.env.POSTGRES_URL)
    console.log('Has database URL:', hasDatabase)

    if (hasDatabase) {
      try {
        console.log('Attempting PostgreSQL login')
        result = await postgresAuthManager.login(email, password, ipAddress, userAgent)
        console.log('PostgreSQL login result:', result?.success)
        
        if (result && result.success) {
          userStats = await postgresAuthManager.getUserStats(result.user!.id)
          usingDatabase = true
        }
      } catch (dbError) {
        console.error('PostgreSQL error:', dbError)
        // Fall through to file system
      }
    }

    if (!result || !result.success) {
      console.log('Using file system fallback')
      // Initialize file system users if needed
      persistentAuthManager.initializeTestUsers()
      result = persistentAuthManager.login(email, password, ipAddress, userAgent)
      console.log('File system login result:', result?.success)
      
      if (result && result.success) {
        userStats = persistentAuthManager.getUserStats(result.user!.id)
      }
    }

    if (result && result.success) {
      console.log('Login successful, returning response')
      return NextResponse.json({
        success: true,
        user: result.user,
        sessionId: result.sessionId,
        userStats,
        debug: {
          usingDatabase,
          hasDatabase
        }
      })
    } else {
      console.log('Login failed:', result?.error)
      return NextResponse.json({ error: result?.error || 'Login failed' }, { status: 401 })
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}