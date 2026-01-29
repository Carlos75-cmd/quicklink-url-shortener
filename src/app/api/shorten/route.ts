import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { postgresUrlDatabase } from '@/lib/database-postgres'
import { userManager } from '@/lib/user-management'
import { postgresAuthManager } from '@/lib/auth-postgres'

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

    // Check if user is authenticated
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const sessionId = authHeader.substring(7)
      authenticatedUser = await postgresAuthManager.getUserBySession(sessionId)
      
      if (authenticatedUser) {
        userId = authenticatedUser.id
        userPlan = authenticatedUser.plan
        isAuthenticated = true
      } else {
        userId = userManager.generateUserId(ipAddress, userAgent)
      }
    } else {
      userId = userManager.generateUserId(ipAddress, userAgent)
    }

    // For authenticated users with paid plans, check subscription validity
    if (isAuthenticated && (userPlan === 'pro' || userPlan === 'enterprise')) {
      const userStats = await postgresAuthManager.getUserStats(userId)
      
      // If subscription expired, they should be downgraded to free (handled in getUserBySession)
      if (authenticatedUser!.plan === 'free') {
        userPlan = 'free'
        // Apply free user limits
        const canCreate = userManager.canCreateUrl(userId, ipAddress, userAgent)
        
        if (!canCreate.canCreate) {
          return NextResponse.json({ 
            error: `Your subscription has expired. ${canCreate.reason === 'daily_limit_exceeded' ? 'Daily limit reached' : 'Monthly limit reached'}`,
            upgradeMessage: 'Renew your subscription for unlimited URLs',
            needsUpgrade: true,
            subscriptionExpired: true
          }, { status: 429 })
        }
      }
      // Unlimited access for active paid users
    } else {
      // Check limits for free users (both authenticated and anonymous)
      const canCreate = userManager.canCreateUrl(userId, ipAddress, userAgent)
      
      if (!canCreate.canCreate) {
        let errorMessage = 'Usage limit exceeded'
        let upgradeMessage = ''

        if (canCreate.reason === 'daily_limit_exceeded') {
          errorMessage = `Daily limit reached (${canCreate.used}/${canCreate.limit} URLs today)`
          upgradeMessage = 'Upgrade to Pro for unlimited URLs'
        } else if (canCreate.reason === 'monthly_limit_exceeded') {
          errorMessage = `Monthly limit reached (${canCreate.used}/${canCreate.limit} URLs this month)`
          upgradeMessage = 'Upgrade to Pro for unlimited URLs'
        }

        return NextResponse.json({ 
          error: errorMessage,
          upgradeMessage,
          limit: canCreate.limit,
          used: canCreate.used,
          planType: canCreate.planType,
          needsUpgrade: true
        }, { status: 429 })
      }
    }

    // Generate short code
    const shortCode = nanoid(8)
    
    // Store in database
    await postgresUrlDatabase.set(shortCode, {
      originalUrl: url,
      shortCode,
      clicks: 0,
      createdAt: new Date(),
      userId
    })

    // Record URL creation
    if (isAuthenticated) {
      await postgresAuthManager.incrementUrlCount(userId)
    } else {
      userManager.recordUrlCreation(userId, ipAddress, userAgent)
    }

    const shortUrl = `${request.nextUrl.origin}/${shortCode}`

    // Get updated user stats
    let userStats
    if (isAuthenticated) {
      userStats = await postgresAuthManager.getUserStats(userId)
    } else {
      const tempStats = userManager.getUserStats(userId)
      userStats = {
        plan: tempStats?.plan || 'free',
        urlsCreated: tempStats?.urlsCreated || 0,
        urlsCreatedToday: tempStats?.urlsCreatedToday || 0
      }
    }

    return NextResponse.json({ 
      shortUrl,
      shortCode,
      originalUrl: url,
      userStats
    })

  } catch (error) {
    console.error('Error shortening URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  // Return stats for admin/analytics
  const stats = {
    totalUrls: await postgresUrlDatabase.size(),
    totalClicks: await postgresUrlDatabase.getTotalClicks()
  }
  
  return NextResponse.json(stats)
}