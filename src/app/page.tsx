'use client'

import { useState } from 'react'
import { Link, Copy, BarChart3, Shield, Zap } from 'lucide-react'
import PayPalButton from '@/components/PayPalButton'

export default function Home() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      const data = await response.json()
      if (data.shortUrl) {
        setShortUrl(data.shortUrl)
      }
    } catch (error) {
      console.error('Error shortening URL:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">QuickLink</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-500 hover:text-gray-900">Pricing</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Sign Up
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Shorten URLs with
            <span className="text-blue-600"> Advanced Analytics</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create short, branded links that drive engagement. Track clicks, analyze traffic, and optimize your marketing campaigns.
          </p>

          {/* URL Shortener Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter your long URL here..."
                className="flex-1 px-6 py-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </form>

            {/* Result */}
            {shortUrl && (
              <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Your shortened URL:</p>
                    <p className="text-lg font-mono text-blue-600">{shortUrl}</p>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="ml-4 p-2 text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">Track clicks, locations, devices, and referrers with detailed insights.</p>
            </div>
            <div className="text-center p-6">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Enterprise-grade security with 99.9% uptime guarantee.</p>
            </div>
            <div className="text-center p-6">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Global CDN ensures your links redirect instantly worldwide.</p>
            </div>
          </div>

          {/* Pricing */}
          <div id="pricing" className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Simple Pricing</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <p className="text-3xl font-bold mb-4">$0<span className="text-sm text-gray-500">/month</span></p>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ 100 links/month</li>
                  <li>✓ Basic analytics</li>
                  <li>✓ Standard support</li>
                </ul>
                <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Get Started
                </button>
              </div>
              <div className="text-center p-6 border-2 border-blue-600 rounded-lg relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                  Popular
                </div>
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <p className="text-3xl font-bold mb-4">$9<span className="text-sm text-gray-500">/month</span></p>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ Unlimited links</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Custom domains</li>
                  <li>✓ Priority support</li>
                </ul>
                <div className="w-full">
                  <PayPalButton 
                    planId="P-5ML4271244454362WXNWU5NQ"
                    planName="Pro Plan"
                  />
                </div>
              </div>
              <div className="text-center p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                <p className="text-3xl font-bold mb-4">$49<span className="text-sm text-gray-500">/month</span></p>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Team management</li>
                  <li>✓ API access</li>
                  <li>✓ White-label solution</li>
                </ul>
                <div className="w-full">
                  <PayPalButton 
                    planId="P-1GJ4568789604323WXNWU6NQ"
                    planName="Enterprise Plan"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 QuickLink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}