import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { postgresUrlDatabase } from '@/lib/database-postgres'
import { postgresAuthManager } from '@/lib/auth-postgres'
import { persistentAuthManager } from '@/lib/persistent-auth'

// Public API for Enterprise users
export async function POST(request: NextRequest) {
  try {
    const { url, customCode } = await request.json()

    if (!url) {
      return NextResponse.json({ 
        error: 'URL is required',
        code: 'MISSING_URL'
      }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ 
        error: 'Invalid URL format',
        code: 'INVALID_URL'
      }, { status: 400 })
    }

    // Check API key authentication
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key required',
        code: 'MISSING_API_KEY'
      }, { status: 401 })
    }

    // Validate API key and get user
    let user = null
    let usingDatabase = false

    try {
      if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
        user = await postgresAuthManager.getUserByApiKey(apiKey)
        usingDatabase = true
      } else {
        throw new Error('No database URL, using fallback')
      }
    } catch (dbError) {
      console.log('PostgreSQL not available for API key validation, using fallback')
      user = persistentAuthManager.getUserByApiKey(apiKey)
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      }, { status: 401 })
    }

    // Check if user has API access (Enterprise only)
    if (user.plan !== 'enterprise') {
      return NextResponse.json({ 
        error: 'API access requires Enterprise plan',
        code: 'INSUFFICIENT_PLAN'
      }, { status: 403 })
    }

    // Check API rate limits (1M requests/month for Enterprise)
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    let apiUsage
    
    try {
      if (usingDatabase) {
        apiUsage = await postgresAuthManager.getApiUsage(user.id, currentMonth)
      } else {
        apiUsage = persistentAuthManager.getApiUsage(user.id, currentMonth)
      }
    } catch (error) {
      console.error('Error checking API usage:', error)
      apiUsage = { requests: 0, limit: 1000000 }
    }

    if (apiUsage.requests >= apiUsage.limit) {
      return NextResponse.json({ 
        error: 'Monthly API limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        limit: apiUsage.limit,
        used: apiUsage.requests,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      }, { status: 429 })
    }

    // Generate short code
    const shortCode = customCode || nanoid(8)

    // Check if custom code is already taken
    if (customCode) {
      let existingUrl
      try {
        if (usingDatabase) {
          existingUrl = await postgresUrlDatabase.get(shortCode)
        } else {
          const { urlDatabase } = await import('@/lib/database')
          existingUrl = urlDatabase.get(shortCode)
        }
      } catch (error) {
        console.error('Error checking existing URL:', error)
      }

      if (existingUrl) {
        return NextResponse.json({ 
          error: 'Custom code already exists',
          code: 'CODE_EXISTS'
        }, { status: 409 })
      }
    }

    // Store URL
    const urlData = {
      originalUrl: url,
      shortCode,
      clicks: 0,
      createdAt: new Date(),
      userId: user.id,
      createdViaApi: true
    }

    try {
      if (usingDatabase) {
        await postgresUrlDatabase.set(shortCode, urlData)
      } else {
        const { urlDatabase } = await import('@/lib/database')
        urlDatabase.set(shortCode, urlData)
      }
    } catch (error) {
      console.error('Error storing URL:', error)
      return NextResponse.json({ 
        error: 'Failed to create short URL',
        code: 'STORAGE_ERROR'
      }, { status: 500 })
    }

    // Increment API usage
    try {
      if (usingDatabase) {
        await postgresAuthManager.incrementApiUsage(user.id, currentMonth)
      } else {
        persistentAuthManager.incrementApiUsage(user.id, currentMonth)
      }
    } catch (error) {
      console.error('Error incrementing API usage:', error)
    }

    const shortUrl = `${request.nextUrl.origin}/${shortCode}`

    return NextResponse.json({ 
      success: true,
      shortUrl,
      shortCode,
      originalUrl: url,
      createdAt: urlData.createdAt,
      apiUsage: {
        used: apiUsage.requests + 1,
        limit: apiUsage.limit,
        remaining: apiUsage.limit - apiUsage.requests - 1
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

// Get API usage stats
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key required',
        code: 'MISSING_API_KEY'
      }, { status: 401 })
    }

    // Validate API key and get user
    let user = null
    let usingDatabase = false

    try {
      if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
        user = await postgresAuthManager.getUserByApiKey(apiKey)
        usingDatabase = true
      } else {
        throw new Error('No database URL, using fallback')
      }
    } catch (dbError) {
      user = persistentAuthManager.getUserByApiKey(apiKey)
    }

    if (!user || user.plan !== 'enterprise') {
      return NextResponse.json({ 
        error: 'Invalid API key or insufficient plan',
        code: 'UNAUTHORIZED'
      }, { status: 401 })
    }

    const currentMonth = new Date().toISOString().slice(0, 7)
    let apiUsage

    try {
      if (usingDatabase) {
        apiUsage = await postgresAuthManager.getApiUsage(user.id, currentMonth)
      } else {
        apiUsage = persistentAuthManager.getApiUsage(user.id, currentMonth)
      }
    } catch (error) {
      apiUsage = { requests: 0, limit: 1000000 }
    }

    return NextResponse.json({
      plan: user.plan,
      apiUsage: {
        used: apiUsage.requests,
        limit: apiUsage.limit,
        remaining: apiUsage.limit - apiUsage.requests,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
      },
      currentMonth
    })

  } catch (error) {
    console.error('API Stats Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}