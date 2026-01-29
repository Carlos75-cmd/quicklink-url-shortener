'use client'

import { PayPalButtons } from '@paypal/react-paypal-js'
import { useState } from 'react'

interface SimplePayPalButtonProps {
  amount: string
  planName: string
  onSuccess?: (orderId: string) => void
  onError?: (error: any) => void
}

export default function SimplePayPalButton({ amount, planName, onSuccess, onError }: SimplePayPalButtonProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="w-full">
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
            label: 'pay'
          }}
          createOrder={(data, actions) => {
            setLoading(true)
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [{
                amount: {
                  value: amount,
                  currency_code: 'USD'
                },
                description: `${planName} - Monthly Subscription`
              }]
            })
          }}
          onApprove={async (data, actions) => {
            try {
              const order = await actions.order?.capture()
              console.log('Payment successful:', order)
              
              // Call your backend to save the payment
              const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderID,
                  planName: planName,
                  amount: amount
                })
              })

              if (response.ok) {
                onSuccess?.(data.orderID)
                // Redirect to success page
                window.location.href = '/success?order=' + data.orderID
              } else {
                throw new Error('Failed to save payment')
              }
            } catch (error) {
              console.error('Payment error:', error)
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
    </div>
  )
}