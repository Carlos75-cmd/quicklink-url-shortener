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

  // Get URL from database
  const urlData = await postgresUrlDatabase.get(shortCode)

  if (!urlData) {
    notFound()
  }

  // Increment click count
  await postgresUrlDatabase.incrementClicks(shortCode)

  // Redirect to original URL
  redirect(urlData.originalUrl)
}

// Generate metadata for better SEO
export async function generateMetadata({ params }: PageProps) {
  const { shortCode } = await params
  const urlData = await postgresUrlDatabase.get(shortCode)

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