// PayPal configuration
export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test'

export const PAYPAL_PLANS = {
  PRO: {
    id: process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID || 'P-5ML4271244454362WXNWU5NQ',
    name: 'Pro Plan',
    price: '$9',
    description: 'Unlimited links, advanced analytics, custom domains'
  },
  ENTERPRISE: {
    id: process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID || 'P-1GJ4568789604323WXNWU6NQ',
    name: 'Enterprise Plan', 
    price: '$49',
    description: 'Everything in Pro + team management, API access, white-label'
  }
}

export const PAYPAL_OPTIONS = {
  clientId: PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'subscription',
  vault: true
}