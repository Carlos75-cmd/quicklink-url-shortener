import { XCircle, ArrowLeft } from 'lucide-react'

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-xl p-8">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-8">
          No worries! Your payment was cancelled and you haven't been charged anything.
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-6">
            You can still use QuickLink with our free plan, or try upgrading again anytime.
          </p>

          <div className="space-y-3">
            <a
              href="/"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to QuickLink
            </a>
            
            <a
              href="/#pricing"
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors inline-block"
            >
              View Pricing Again
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Questions? Contact us at support@quicklink.com
          </p>
        </div>
      </div>
    </div>
  )
}