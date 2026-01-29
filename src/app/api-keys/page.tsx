'use client'

import { useState, useEffect } from 'react'
import { Key, Copy, RefreshCw, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
}

interface ApiUsage {
  used: number
  limit: number
  remaining: number
  resetDate: string
}

export default function ApiKeysPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [apiKey, setApiKey] = useState<string>('')
  const [apiUsage, setApiUsage] = useState<ApiUsage | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setCurrentUser(user)
        
        if (user.plan !== 'enterprise') {
          setMessage({ type: 'error', text: 'API access requires Enterprise plan' })
        } else {
          loadApiUsage()
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    } else {
      window.location.href = '/login'
    }
  }, [])

  const loadApiUsage = async () => {
    const sessionId = localStorage.getItem('sessionId')
    if (!sessionId) return

    try {
      const response = await fetch('/api/v1/shorten', {
        method: 'GET',
        headers: {
          'x-api-key': apiKey || 'temp'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApiUsage(data.apiUsage)
      }
    } catch (error) {
      console.error('Error loading API usage:', error)
    }
  }

  const generateApiKey = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const sessionId = localStorage.getItem('sessionId')
      const response = await fetch('/api/generate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setApiKey(data.apiKey)
        setMessage({ type: 'success', text: 'API key generated successfully!' })
        loadApiUsage()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to generate API key' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setMessage({ type: 'success', text: 'API key copied to clipboard!' })
    setTimeout(() => setMessage(null), 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!currentUser) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>
  }

  if (currentUser.plan !== 'enterprise') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">API Access Required</h1>
          <p className="text-gray-600 mb-6">
            API access is only available for Enterprise plan users.
          </p>
          <a
            href="/#pricing"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade to Enterprise
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">API Management</span>
            </div>
            <nav className="flex space-x-4">
              <a href="/" className="text-gray-500 hover:text-gray-900">Home</a>
              <a href="/analytics" className="text-gray-500 hover:text-gray-900">Analytics</a>
              <a href="/admin" className="text-gray-500 hover:text-gray-900">My Links</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Keys & Usage</h1>
          <p className="text-gray-600">
            Manage your API keys and monitor usage for programmatic access to URL shortening.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* API Key Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your API Key</h2>
          
          {!apiKey ? (
            <div className="text-center py-8">
              <Key className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">
                Generate an API key to start making programmatic requests to shorten URLs.
              </p>
              <button
                onClick={generateApiKey}
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center mx-auto"
              >
                {isLoading ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Key className="h-5 w-5 mr-2" />
                )}
                {isLoading ? 'Generating...' : 'Generate API Key'}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="font-mono text-sm text-gray-900">
                    {showKey ? apiKey : '•'.repeat(40) + apiKey.slice(-8)}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={copyApiKey}
                    className="text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Keep your API key secure and don't share it publicly.
                </p>
                <button
                  onClick={generateApiKey}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        {apiUsage && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Usage Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{apiUsage.used.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Requests Used</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{apiUsage.remaining.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">{apiUsage.limit.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Monthly Limit</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Usage Progress</span>
                <span>{Math.round((apiUsage.used / apiUsage.limit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((apiUsage.used / apiUsage.limit) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Resets on {formatDate(apiUsage.resetDate)}
              </p>
            </div>
          </div>
        )}

        {/* API Documentation */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Documentation</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Shorten URL</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <code className="text-sm">
                  POST /api/v1/shorten<br/>
                  Headers: x-api-key: YOUR_API_KEY<br/>
                  Body: {"{"}"url": "https://example.com", "customCode": "optional"{"}"}
                </code>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Get Usage Stats</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <code className="text-sm">
                  GET /api/v1/shorten<br/>
                  Headers: x-api-key: YOUR_API_KEY
                </code>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Rate Limits</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Enterprise: 1,000,000 requests per month</li>
                <li>• Custom short codes supported</li>
                <li>• All shortened URLs tracked in your dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}