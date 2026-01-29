import { NextRequest, NextResponse } from 'next/server'
import { postgresAuthManager } from '@/lib/auth-postgres'
import { persistentAuthManager } from '@/lib/persistent-auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionId = authHeader.substring(7)
    let user = null
    let usingDatabase = false

    // Try PostgreSQL first, then fallback
    try {
      if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
        user = await postgresAuthManager.getUserBySession(sessionId)
        usingDatabase = true
      } else {
        throw new Error('No database URL, using fallback')
      }
    } catch (dbError) {
      console.log('PostgreSQL not available for API key generation, using fallback')
      user = persistentAuthManager.getUserBySession(sessionId)
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    if (user.plan !== 'enterprise') {
      return NextResponse.json({ 
        error: 'API keys are only available for Enterprise users' 
      }, { status: 403 })
    }

    // Generate API key
    let apiKey: string
    try {
      if (usingDatabase) {
        apiKey = await postgresAuthManager.generateApiKey(user.id)
      } else {
        apiKey = persistentAuthManager.generateApiKey(user.id)
      }
    } catch (error) {
      console.error('Error generating API key:', error)
      return NextResponse.json({ 
        error: 'Failed to generate API key' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      apiKey,
      message: 'API key generated successfully'
    })

  } catch (error) {
    console.error('API key generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}