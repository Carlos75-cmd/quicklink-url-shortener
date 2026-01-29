import { NextRequest, NextResponse } from 'next/server'
import { persistentAuthManager } from '@/lib/persistent-auth'

// Simple in-memory storage for subscriptions (replace with database in production)
const subscriptions = new Map<string, {
  subscriptionId: string
  planName: string
  status: string
  createdAt: Date
  email?: string
  userId?: string
}>()

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, planName, email } = await request.json()

    if (!subscriptionId || !planName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user info from request
    const authHeader = request.headers.get('authorization')
    let userId: string | undefined

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const sessionId = authHeader.substring(7)
      const user = persistentAuthManager.getUserBySession(sessionId)
      if (user) {
        userId = user.id
      }
    }

    // Determine plan type and duration
    let planType: 'pro' | 'enterprise' = 'pro'
    let durationMonths = 1

    if (planName.toLowerCase().includes('enterprise')) {
      planType = 'enterprise'
    }

    // Update user subscription if user is authenticated
    if (userId) {
      persistentAuthManager.updateUserSubscription(userId, {
        subscriptionId,
        plan: planType,
        status: 'active',
        durationMonths
      })
    }

    // Save subscription to database
    subscriptions.set(subscriptionId, {
      subscriptionId,
      planName,
      status: 'active',
      createdAt: new Date(),
      email,
      userId
    })

    console.log(`New subscription: ${subscriptionId} for ${planName} (User: ${userId || 'anonymous'})`)

    return NextResponse.json({ 
      success: true,
      subscriptionId,
      planType,
      userId,
      message: 'Subscription activated successfully'
    })

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  // Return all subscriptions for admin
  const allSubscriptions = Array.from(subscriptions.values())
  
  // Calculate revenue based on plan types
  const revenue = allSubscriptions.reduce((total, sub) => {
    if (sub.planName.toLowerCase().includes('enterprise')) {
      return total + 49
    } else {
      return total + 9
    }
  }, 0)
  
  return NextResponse.json({ 
    subscriptions: allSubscriptions,
    totalRevenue: revenue,
    totalSubscriptions: allSubscriptions.length
  })
}