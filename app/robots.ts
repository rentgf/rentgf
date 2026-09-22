import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard',
          '/messages',
          '/notifications',
          '/settings',
          '/booking/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard',
          '/messages',
          '/notifications',
          '/settings',
          '/booking/',
        ],
      },
    ],
    sitemap: 'https://rentgf.site/sitemap.xml',
    host: 'https://rentgf.site',
  }
}
