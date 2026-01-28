import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { urlDatabase } from '@/lib/database'

interface PageProps {
  params: {
    shortCode: string
  }
}

export default async function RedirectPage({ params }: PageProps) {
  const { shortCode } = params

  // Get URL from database
  const urlData = urlDatabase.get(shortCode)

  if (!urlData) {
    notFound()
  }

  // Increment click count
  urlData.clicks += 1
  urlDatabase.set(shortCode, urlData)

  // Redirect to original URL
  redirect(urlData.originalUrl)
}

// Generate metadata for better SEO
export async function generateMetadata({ params }: PageProps) {
  const { shortCode } = params
  const urlData = urlDatabase.get(shortCode)

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