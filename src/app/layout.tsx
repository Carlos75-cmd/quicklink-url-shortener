import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'QuickLink - Free URL Shortener with Analytics',
    template: '%s | QuickLink'
  },
  description: 'Shorten long URLs for free. Track clicks, analyze traffic, and optimize your links with advanced analytics. No registration required.',
  keywords: ['url shortener', 'link shortener', 'short url', 'link analytics', 'free url shortener', 'custom short links'],
  authors: [{ name: 'QuickLink' }],
  creator: 'QuickLink',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://quicklink-url-shortener.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'QuickLink',
    title: 'QuickLink - Free URL Shortener with Analytics',
    description: 'Shorten long URLs for free. Track clicks, analyze traffic, and optimize your links with advanced analytics.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'QuickLink - URL Shortener'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickLink - Free URL Shortener with Analytics',
    description: 'Shorten long URLs for free. Track clicks, analyze traffic, and optimize your links.',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || ''
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
