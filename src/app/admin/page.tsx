'use client'

import { useState, useEffect } from 'react'
import { Link, ExternalLink, Copy, BarChart3 } from 'lucide-react'

interface UrlData {
  originalUrl: string
  shortCode: string
  clicks: number
  createdAt: string
}

export default function AdminDashboard() {
  const [urls, setUrls] = useState<UrlData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/admin/urls')
      if (response.ok) {
        const data = await response.json()
        setUrls(data.urls)
      }
    } catch (error) {
      console.error('Error fetching URLs:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (shortCode: string) => {
    const shortUrl = `${window.location.origin}/${shortCode}`
    navigator.clipboard.writeText(shortUrl)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              <span className="ml-2 text-2xl font-bold text-gray-900">QuickLink Admin</span>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-900">Home</a>
              <a href="/analytics" className="text-gray-500 hover:text-gray-900">Analytics</a>
              <a href="/admin" className="text-blue-600 font-semibold">Admin</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all shortened URLs and monitor performance</p>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Link className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">{urls.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {urls.reduce((sum, url) => sum + url.clicks, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <ExternalLink className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg. Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {urls.length > 0 ? (urls.reduce((sum, url) => sum + url.clicks, 0) / urls.length).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* URLs Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Shortened URLs</h2>
          </div>
          
          {urls.length === 0 ? (
            <div className="text-center py-12">
              <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No URLs created yet</p>
              <a href="/" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                Create your first short link
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Short Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {urls.map((url) => (
                    <tr key={url.shortCode} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <code className="text-sm font-mono text-blue-600">
                            /{url.shortCode}
                          </code>
                          <button
                            onClick={() => copyToClipboard(url.shortCode)}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {url.originalUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {url.clicks} clicks
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(url.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a
                          href={`/${url.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Visit
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}