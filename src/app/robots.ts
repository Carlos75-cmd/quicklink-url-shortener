import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://quicklink-url-shortener.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login', '/analytics'],
        disallow: ['/api/', '/admin', '/api-keys']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  }
}
