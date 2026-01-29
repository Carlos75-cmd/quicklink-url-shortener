import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for subscriptions (replace with database in production)
const subscriptions = new Map<string, {
  subscriptionId: string
  planName: string
  status: string
  createdAt: Date
  email?: string
}>()

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, planName, email } = await request.json()

    if (!subscriptionId || !planName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save subscription to database
    subscriptions.set(subscriptionId, {
      subscriptionId,
      planName,
      status: 'active',
      createdAt: new Date(),
      email
    })

    console.log(`New subscription: ${subscriptionId} for ${planName}`)

    return NextResponse.json({ 
      success: true,
      subscriptionId,
      message: 'Subscription created successfully'
    })

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  // Return all subscriptions for admin
  const allSubscriptions = Array.from(subscriptions.values())
  
  return NextResponse.json({ 
    subscriptions: allSubscriptions,
    totalRevenue: allSubscriptions.length * 9, // Assuming $9 per subscription
    totalSubscriptions: allSubscriptions.length
  })
}