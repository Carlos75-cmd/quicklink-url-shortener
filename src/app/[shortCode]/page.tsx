import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { postgresUrlDatabase } from '@/lib/database-postgres'

interface PageProps {
  params: Promise<{
    shortCode: string
  }>
}

export default async function RedirectPage({ params }: PageProps) {
  const { shortCode } = await params

  let urlData = null

  // Try PostgreSQL first, then fallback to file system
  try {
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      urlData = await postgresUrlDatabase.get(shortCode)
    } else {
      throw new Error('No database URL, using fallback')
    }
  } catch (dbError) {
    console.log('PostgreSQL not available for URL lookup, using fallback')
    // Fallback to file system
    const { urlDatabase } = await import('@/lib/database')
    urlData = urlDatabase.get(shortCode)
  }

  if (!urlData) {
    notFound()
  }

  // Increment click count (try both systems)
  try {
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      await postgresUrlDatabase.incrementClicks(shortCode)
    } else {
      throw new Error('No database URL, using fallback')
    }
  } catch (dbError) {
    console.log('PostgreSQL not available for click increment, using fallback')
    const { urlDatabase } = await import('@/lib/database')
    urlDatabase.incrementClicks(shortCode)
  }

  // Redirect to original URL
  redirect(urlData.originalUrl)
}

// Generate metadata for better SEO
export async function generateMetadata({ params }: PageProps) {
  const { shortCode } = await params
  
  let urlData = null

  // Try PostgreSQL first, then fallback to file system
  try {
    if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
      urlData = await postgresUrlDatabase.get(shortCode)
    } else {
      throw new Error('No database URL, using fallback')
    }
  } catch (dbError) {
    console.log('PostgreSQL not available for metadata, using fallback')
    const { urlDatabase } = await import('@/lib/database')
    urlData = urlDatabase.get(shortCode)
  }

  if (!urlData) {
    return {
      title: 'Link Not Found - QuickLink'
    }
  }

  return {
    title: 'Redirecting... - QuickLink',
    description: 'You are being redirected to your destination.'
  }
}