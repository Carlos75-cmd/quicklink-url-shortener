'use client'

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { PAYPAL_OPTIONS } from '@/lib/paypal'
import { useState } from 'react'

interface PayPalButtonProps {
  planId: string
  planName: string
  onSuccess?: (subscriptionId: string) => void
  onError?: (error: any) => void
}

export default function PayPalButton({ planId, planName, onSuccess, onError }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false)

  return (
    <PayPalScriptProvider options={PAYPAL_OPTIONS}>
      <div className="paypal-button-container">
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Processing payment...</p>
          </div>
        )}
        
        <PayPalButtons
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'subscribe'
          }}
          createSubscription={(data, actions) => {
            setLoading(true)
            return actions.subscription.create({
              plan_id: planId,
              application_context: {
                brand_name: 'QuickLink',
                user_action: 'SUBSCRIBE_NOW',
                return_url: `${window.location.origin}/success`,
                cancel_url: `${window.location.origin}/cancel`
              }
            })
          }}
          onApprove={async (data, actions) => {
            try {
              console.log('Subscription approved:', data.subscriptionID)
              
              // Call your backend to save the subscription
              const response = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subscriptionId: data.subscriptionID || '',
                  planName: planName
                })
              })

              if (response.ok) {
                const subscriptionId = data.subscriptionID || ''
                onSuccess?.(subscriptionId)
                // Redirect to success page
                window.location.href = '/success?subscription=' + subscriptionId
              } else {
                throw new Error('Failed to save subscription')
              }
            } catch (error) {
              console.error('Subscription error:', error)
              onError?.(error)
            } finally {
              setLoading(false)
            }
          }}
          onError={(err) => {
            console.error('PayPal error:', err)
            setLoading(false)
            onError?.(err)
          }}
          onCancel={() => {
            console.log('Payment cancelled')
            setLoading(false)
          }}
        />
      </div>
    </PayPalScriptProvider>
  )
}