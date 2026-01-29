import { NextRequest, NextResponse } from 'next/server'
import { persistentAuthManager } from '@/lib/persistent-auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const result = persistentAuthManager.register(email, name, password)

    if (result.success) {
      // Auto-login after registration
      const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      const loginResult = persistentAuthManager.login(email, password, ipAddress, userAgent)
      
      if (loginResult.success) {
        const userStats = persistentAuthManager.getUserStats(loginResult.user!.id)
        
        return NextResponse.json({
          success: true,
          user: {
            id: loginResult.user!.id,
            email: loginResult.user!.email,
            name: loginResult.user!.name,
            plan: loginResult.user!.plan
          },
          sessionId: loginResult.sessionId,
          userStats
        })
      }
    }

    return NextResponse.json({ error: result.error }, { status: 400 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}