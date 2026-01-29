'use client'

import { useState } from 'react'
import { Link, Copy, BarChart3, Shield, Zap } from 'lucide-react'
import PayPalButton from '@/components/PayPalButton'
import PayPalProvider from '@/components/PayPalProvider'

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
    <PayPalProvider>
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
              
              {/* Free Plan */}
              <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-gray-600">Perfect for trying out QuickLink</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800">100 links per month</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800">Basic click analytics</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800">Standard support</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">✗</span>
                    <span className="text-gray-400 text-sm">Custom domains</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-red-400 mr-2">✗</span>
                    <span className="text-gray-400 text-sm">Advanced analytics</span>
                  </li>
                </ul>
                <button className="w-full py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Get Started Free
                </button>
                <p className="text-xs text-gray-500 mt-2">No credit card required</p>
              </div>

              {/* Pro Plan */}
              <div className="text-center p-6 border-2 border-blue-600 rounded-lg relative hover:shadow-xl transition-shadow bg-white">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular - Save $48/year
                </div>
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-blue-600">$9</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <div className="bg-blue-100 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800 font-medium">🚀 Everything you need to grow your business</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>Unlimited</strong> short links</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>Advanced analytics</strong> (geo, devices, referrers)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>Custom domains</strong> (yoursite.com/abc)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>Link passwords</strong> & expiration</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>Priority support</strong> (24h response)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>QR codes</strong> for all links</span>
                  </li>
                </ul>
                <div className="w-full">
                  <PayPalButton 
                    planId="P-3SH66323P5219774ENF5L3YY"
                    planName="Pro Plan"
                  />
                </div>
                <p className="text-xs text-blue-600 mt-2 font-medium">💰 ROI: Typically pays for itself in saved time</p>
              </div>

              {/* Enterprise Plan */}
              <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$49</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 mb-6">
                  <p className="text-sm text-purple-800 font-medium">🏢 Built for teams and agencies</p>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>Everything in Pro</strong></span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>Team management</strong> (up to 10 users)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>Full API access</strong> (1M requests/month)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>White-label</strong> (remove QuickLink branding)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>24/7 phone support</strong> + dedicated manager</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-800"><strong>Advanced integrations</strong> (Zapier, Slack)</span>
                  </li>
                </ul>
                <div className="w-full">
                  <PayPalButton 
                    planId="P-5HV56223BY4879009NF5L3ZA"
                    planName="Enterprise Plan"
                  />
                </div>
                <p className="text-xs text-purple-600 mt-2 font-medium">📞 Need more? Custom plans available</p>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose QuickLink?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <h4 className="font-semibold mb-2">Lightning Fast</h4>
                    <p className="text-sm text-gray-600">Global CDN ensures your links redirect in &lt;50ms worldwide</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📊</div>
                    <h4 className="font-semibold mb-2">Powerful Analytics</h4>
                    <p className="text-sm text-gray-600">Track clicks, locations, devices, and optimize your campaigns</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔒</div>
                    <h4 className="font-semibold mb-2">Enterprise Security</h4>
                    <p className="text-sm text-gray-600">99.9% uptime, SSL encryption, and GDPR compliant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Trusted by thousands of businesses worldwide</p>
              <div className="flex justify-center items-center space-x-8 text-gray-400">
                <span className="text-sm">🔒 Secure payments via PayPal</span>
                <span className="text-sm">💳 Cancel anytime</span>
                <span className="text-sm">📊 30-day money back guarantee</span>
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
    </PayPalProvider>
  )
}