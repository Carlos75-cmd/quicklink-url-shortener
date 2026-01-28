import { NextResponse } from 'next/server'
import { urlDatabase } from '@/lib/database'

export async function GET() {
  try {
    const urls = urlDatabase.getAll()
    
    return NextResponse.json({ 
      urls: urls.map(url => ({
        ...url,
        createdAt: url.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching URLs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}