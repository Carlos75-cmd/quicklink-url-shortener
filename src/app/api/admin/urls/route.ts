import { NextResponse } from 'next/server'
import { postgresUrlDatabase } from '@/lib/database-postgres'

export async function GET() {
  try {
    const urls = await postgresUrlDatabase.getAll()
    
    return NextResponse.json({ 
      urls: urls.map(url => ({
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clicks: url.clicks,
        createdAt: url.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching URLs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}