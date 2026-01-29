import { NextRequest, NextResponse } from 'next/server'
import { postgresAuthManager } from '@/lib/auth-postgres'
import { persistentAuthManager } from '@/lib/persistent-auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    let user = null
    let userStats = null
    
    // Try PostgreSQL first, then fallback
    try {
      if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
        user = await postgresAuthManager.getUserBySession(sessionId)
        if (user) {
          userStats = await postgresAuthManager.getUserStats(user.id)
        }
      } else {
        throw new Error('No database URL, using fallback')
      }
    } catch (dbError) {
      console.log('PostgreSQL not available for user stats, using fallback')
      user = persistentAuthManager.getUserBySession(sessionId)
      if (user) {
        userStats = persistentAuthManager.getUserStats(user.id)
      }
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    return NextResponse.json(userStats)

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}