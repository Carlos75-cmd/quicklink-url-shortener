import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { postgresUrlDatabase } from '@/lib/database-postgres'
import { userManager } from '@/lib/user-management'
import { postgresAuthManager } from '@/lib/auth-postgres'
import { persistentAuthManager } from '@/lib/persistent-auth'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Get user info from request
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const authHeader = request.headers.get('authorization')
    
    let userId: string
    let userPlan: 'free' | 'pro' | 'enterprise' = 'free'
    let isAuthenticated = false
    let authenticatedUser = null
    let usingDatabase = false

    // Check if user is authenticated
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const sessionId = authHeader.substring(7)
      
      // Try PostgreSQL first, then fallback
      try {
        if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
          authenticatedUser = await postgresAuthManager.getUserBySession(sessionId)
          usingDatabase = true
        }
      } catch (dbError) {
        console.log('PostgreSQL not available for session check, using fallback')
      }
      
      if (!authenticatedUser) {
        authenticatedUser = persistentAuthManager.getUserBySession(sessionId)
      }
      
      if (authenticatedUser) {
        userId = authenticatedUser.id
        userPlan = authenticatedUser.plan
        isAuthenticated = true
        console.log(`Authenticated user: ${authenticatedUser.email} (${userPlan})`)
      } else {
        userId = userManager.generateUserId(ipAddress, userAgent)
        console.log(`Anonymous user: ${userId}`)
      }
    } else {
      userId = userManager.generateUserId(ipAddress, userAgent)
      console.log(`Anonymous user: ${userId}`)
    }

    // Apply limits based on user type and plan
    if (isAuthenticated && (userPlan === 'pro' || userPlan === 'enterprise')) {
      // Check if subscription is still active
      let userStats
      try {
        if (usingDatabase) {
          userStats = await postgresAuthManager.getUserStats(userId)
        } else {
          userStats = persistentAuthManager.getUserStats(userId)
        }
        
        // If subscription expired, they should be downgraded to free
        if (userStats && userStats.daysRemaining === 0) {
          userPlan = 'free'
          console.log(`User subscription expired, applying free limits`)
        } else {
          console.log(`Pro/Enterprise user with ${userStats?.daysRemaining} days remaining - unlimited access`)
          // Unlimited access for active paid users
        }
      } catch (error) {
        console.error('Error checking user stats:', error)
        // If we can't check stats, treat as free user for safety
        userPlan = 'free'
      }
    }

    // Apply limits for free users (both authenticated and anonymous)
    if (!isAuthenticated || userPlan === 'free') {
      const canCreate = userManager.canCreateUrl(userId, ipAddress, userAgent)
      
      if (!canCreate.canCreate) {
        let errorMessage = 'Usage limit exceeded'
        let upgradeMessage = ''

        if (canCreate.reason === 'daily_limit_exceeded') {
          errorMessage = `Daily limit reached (${canCreate.used}/${canCreate.limit} URLs today)`
          upgradeMessage = isAuthenticated ? 'Upgrade to Pro for unlimited URLs' : 'Sign up and upgrade to Pro for unlimited URLs'
        } else if (canCreate.reason === 'monthly_limit_exceeded') {
          errorMessage = `Monthly limit reached (${canCreate.used}/${canCreate.limit} URLs this month)`
          upgradeMessage = isAuthenticated ? 'Upgrade to Pro for unlimited URLs' : 'Sign up and upgrade to Pro for unlimited URLs'
        }

        return NextResponse.json({ 
          error: errorMessage,
          upgradeMessage,
          limit: canCreate.limit,
          used: canCreate.used,
          planType: canCreate.planType,
          needsUpgrade: true,
          isAuthenticated
        }, { status: 429 })
      }
    }

    // Generate short code
    const shortCode = nanoid(8)
    
    // Store in database (try PostgreSQL first, fallback to file system)
    try {
      if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
        await postgresUrlDatabase.set(shortCode, {
          originalUrl: url,
          shortCode,
          clicks: 0,
          createdAt: new Date(),
          userId
        })
        console.log(`URL stored in PostgreSQL: ${shortCode}`)
      } else {
        throw new Error('No database URL, using fallback')
      }
    } catch (dbError) {
      console.log('PostgreSQL not available for URL storage, using fallback')
      // Fallback to file system (this won't work in production but helps with development)
      const { urlDatabase } = await import('@/lib/database')
      urlDatabase.set(shortCode, {
        originalUrl: url,
        shortCode,
        clicks: 0,
        createdAt: new Date(),
        userId
      })
    }

    // Record URL creation for usage tracking
    if (isAuthenticated) {
      try {
        if (usingDatabase) {
          await postgresAuthManager.incrementUrlCount(userId)
        } else {
          persistentAuthManager.incrementUrlCount(userId)
        }
      } catch (error) {
        console.error('Error incrementing URL count for authenticated user:', error)
      }
    } else {
      // For anonymous users, always use the temporary tracking system
      userManager.recordUrlCreation(userId, ipAddress, userAgent)
    }

    const shortUrl = `${request.nextUrl.origin}/${shortCode}`

    // Get updated user stats
    let userStats
    if (isAuthenticated) {
      try {
        if (usingDatabase) {
          userStats = await postgresAuthManager.getUserStats(userId)
        } else {
          userStats = persistentAuthManager.getUserStats(userId)
        }
      } catch (error) {
        console.error('Error getting user stats:', error)
      }
    } else {
      const tempStats = userManager.getUserStats(userId)
      userStats = {
        plan: tempStats?.plan || 'free',
        urlsCreated: tempStats?.urlsCreated || 0,
        urlsCreatedToday: tempStats?.urlsCreatedToday || 0
      }
    }

    console.log(`URL created successfully: ${shortCode} for user ${userId} (${userPlan})`)

    return NextResponse.json({ 
      shortUrl,
      shortCode,
      originalUrl: url,
      userStats,
      debug: {
        isAuthenticated,
        userPlan,
        usingDatabase
      }
    })

  } catch (error) {
    console.error('Error shortening URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  // Return stats for admin/analytics
  try {
    let stats
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      stats = {
        totalUrls: await postgresUrlDatabase.size(),
        totalClicks: await postgresUrlDatabase.getTotalClicks()
      }
    } else {
      const { urlDatabase } = await import('@/lib/database')
      stats = {
        totalUrls: urlDatabase.size(),
        totalClicks: urlDatabase.getTotalClicks()
      }
    }
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error getting stats:', error)
    return NextResponse.json({ totalUrls: 0, totalClicks: 0 })
  }
}