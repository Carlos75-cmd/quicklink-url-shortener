import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { urlDatabase } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    // Generate short code
    const shortCode = nanoid(8)
    
    // Store in database
    urlDatabase.set(shortCode, {
      originalUrl: url,
      shortCode,
      clicks: 0,
      createdAt: new Date()
    })

    const shortUrl = `${request.nextUrl.origin}/${shortCode}`

    return NextResponse.json({ 
      shortUrl,
      shortCode,
      originalUrl: url 
    })

  } catch (error) {
    console.error('Error shortening URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  // Return stats for admin/analytics
  const stats = {
    totalUrls: urlDatabase.size(),
    totalClicks: urlDatabase.getTotalClicks()
  }
  
  return NextResponse.json(stats)
}