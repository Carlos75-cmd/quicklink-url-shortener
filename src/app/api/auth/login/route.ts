import { NextRequest, NextResponse } from 'next/server'
import { persistentAuthManager } from '@/lib/persistent-auth'

// Initialize test users on first load
persistentAuthManager.initializeTestUsers()

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const result = persistentAuthManager.login(email, password, ipAddress, userAgent)

    if (result.success) {
      // Get user stats
      const userStats = persistentAuthManager.getUserStats(result.user!.id)
      
      return NextResponse.json({
        success: true,
        user: {
          id: result.user!.id,
          email: result.user!.email,
          name: result.user!.name,
          plan: result.user!.plan
        },
        sessionId: result.sessionId,
        userStats
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}