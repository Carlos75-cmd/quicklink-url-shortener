'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js'

const paypalOptions = {
  clientId: 'Aev84IB12Q1N3-92HfV-IgV9bVrlhRw3Nfp0Vf-S7x97l3JoO5tViXMHQThSUQGYSx3xbiyIwQSBtg0d',
  currency: 'USD',
  intent: 'subscription' as const,
  vault: true
}

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      {children}
    </PayPalScriptProvider>
  )
}