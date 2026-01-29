'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Link as LinkIcon } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get('subscription')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-xl p-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to QuickLink Pro! 🎉
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your subscription has been activated successfully. You now have access to all Pro features!
        </p>

        {subscriptionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Subscription ID:</p>
            <p className="font-mono text-sm text-gray-800">{subscriptionId}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-2">What's included:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Unlimited short links</li>
              <li>✅ Advanced analytics dashboard</li>
              <li>✅ Custom domains</li>
              <li>✅ Priority support</li>
              <li>✅ API access</li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <a
              href="/"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Start Creating Links
            </a>
            
            <a
              href="/analytics"
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors inline-block"
            >
              View Analytics Dashboard
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact us at support@quicklink.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}