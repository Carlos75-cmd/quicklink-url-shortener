import { NextRequest, NextResponse } from 'next/server'
import { postgresAuthManager } from '@/lib/auth-postgres'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    const user = await postgresAuthManager.getUserBySession(sessionId)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    const userStats = await postgresAuthManager.getUserStats(user.id)
    
    return NextResponse.json(userStats)

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}