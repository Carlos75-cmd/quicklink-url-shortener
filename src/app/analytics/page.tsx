'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Link, MousePointer, Calendar } from 'lucide-react'

interface Stats {
  totalUrls: number
  totalClicks: number
}

export default function Analytics() {
  const [stats, setStats] = useState<Stats>({ totalUrls: 0, totalClicks: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/shorten')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
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
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-900">Home</a>
              <a href="/analytics" className="text-blue-600 font-semibold">Analytics</a>
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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-500">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUrls}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Prompt */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Unlock Advanced Analytics</h2>
          <p className="text-blue-100 mb-6">
            Get detailed insights on click locations, devices, referrers, and more with our Pro plan.
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Upgrade to Pro - $9/month
          </button>
        </div>
      </main>
    </div>
  )
}