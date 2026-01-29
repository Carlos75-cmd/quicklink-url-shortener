'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Link, MousePointer, Calendar, User, LogOut } from 'lucide-react'

interface Stats {
  totalUrls: number
  totalClicks: number
}

interface AuthUser {
  id: string
  email: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
}

export default function Analytics() {
  const [stats, setStats] = useState<Stats>({ totalUrls: 0, totalClicks: 0 })
  const [revenue, setRevenue] = useState({ totalRevenue: 0, totalSubscriptions: 0 })
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [userStats, setUserStats] = useState<any>(null)

  useEffect(() => {
    // Verificar si hay usuario logueado
    const sessionId = localStorage.getItem('sessionId')
    const userData = localStorage.getItem('user')
    
    if (sessionId && userData) {
      try {
        setCurrentUser(JSON.parse(userData))
        fetchUserStats(sessionId)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('sessionId')
        localStorage.removeItem('user')
      }
    }

    fetchStats()
    fetchRevenue()
  }, [])

  const fetchUserStats = async (sessionId: string) => {
    try {
      // This would be a new API endpoint to get user-specific stats
      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${sessionId}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/shorten')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRevenue = async () => {
    try {
      const response = await fetch('/api/subscriptions')
      const data = await response.json()
      setRevenue(data)
    } catch (error) {
      console.error('Error fetching revenue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('sessionId')
    localStorage.removeItem('user')
    setCurrentUser(null)
    window.location.href = '/'
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'bg-blue-100 text-blue-800'
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderUpgradePrompt = () => {
    if (!currentUser || currentUser.plan !== 'free') {
      return null
    }

    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Unlock Advanced Analytics</h2>
        <p className="text-blue-100 mb-6">
          Get detailed insights on click locations, devices, referrers, and more with our Pro plan.
        </p>
        <a 
          href="/#pricing" 
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
        >
          Upgrade to Pro - $9/month
        </a>
      </div>
    )
  }

  const renderAdvancedAnalytics = () => {
    if (!currentUser || currentUser.plan === 'free') {
      return null
    }

    return (
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Advanced Analytics for Pro/Enterprise users */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">United States</span>
              <span className="font-semibold">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Colombia</span>
              <span className="font-semibold">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mexico</span>
              <span className="font-semibold">15%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Others</span>
              <span className="font-semibold">15%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mobile</span>
              <span className="font-semibold">65%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Desktop</span>
              <span className="font-semibold">30%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tablet</span>
              <span className="font-semibold">5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Direct</span>
              <span className="font-semibold">40%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Twitter</span>
              <span className="font-semibold">25%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Facebook</span>
              <span className="font-semibold">20%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Others</span>
              <span className="font-semibold">15%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Click Timeline</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today</span>
              <span className="font-semibold">127 clicks</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Yesterday</span>
              <span className="font-semibold">89 clicks</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Week</span>
              <span className="font-semibold">456 clicks</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold">1,234 clicks</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPlanStatus = () => {
    if (!currentUser) return null

    return (
      <div className="mb-8 p-4 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-gray-700">Current Plan:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(currentUser.plan)}`}>
              {currentUser.plan.toUpperCase()}
            </span>
          </div>
          {userStats && userStats.daysRemaining !== undefined && userStats.daysRemaining > 0 && (
            <span className="text-green-600 text-sm">
              {userStats.daysRemaining} days remaining
            </span>
          )}
          {userStats && userStats.daysRemaining === 0 && (
            <span className="text-red-600 text-sm font-medium">
              Subscription expired
            </span>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
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
            <nav className="flex space-x-8 items-center">
              <a href="/" className="text-gray-500 hover:text-gray-900">Home</a>
              <a href="/analytics" className="text-blue-600 font-semibold">Analytics</a>
              {currentUser && <a href="/admin" className="text-gray-500 hover:text-gray-900">My Links</a>}
              
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Sign In
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Analytics Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your link performance and engagement metrics</p>
        </div>

        {/* Plan Status */}
        {renderPlanStatus()}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Link className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUrls}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <MousePointer className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. CTR</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUrls > 0 ? ((stats.totalClicks / stats.totalUrls) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">{revenue.totalSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">${revenue.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Analytics for Pro/Enterprise */}
        {renderAdvancedAnalytics()}

        {/* Upgrade Prompt for Free users only */}
        {renderUpgradePrompt()}
      </main>
    </div>
  )
}