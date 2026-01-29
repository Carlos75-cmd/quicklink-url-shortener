'use client'

export default function PayPalDebug() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
  const proId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
  const enterpriseId = process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID

  return (
    <div className="bg-gray-100 p-4 rounded-lg text-xs text-gray-600 mt-4">
      <h4 className="font-bold mb-2">Debug Info (remove in production):</h4>
      <p>Client ID: {clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET'}</p>
      <p>Pro Plan ID: {proId || 'NOT SET'}</p>
      <p>Enterprise Plan ID: {enterpriseId || 'NOT SET'}</p>
      <p>Environment: {process.env.NODE_ENV}</p>
    </div>
  )
}