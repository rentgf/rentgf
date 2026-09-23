import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const SITE_URL = 'https://rentgf.site'
const SITE_NAME = 'RentGF'
const TITLE = 'RentGF — Verified Social Companion App in India'
const DESCRIPTION =
  'Book verified female companions for coffee, dining, travel, and events across Delhi, Mumbai, Bengaluru, Hyderabad and more. Safe, lawful, non-sexual companionship. 18+.'
const OG_IMAGE = 'https://hercules-cdn.com/file_5dWAanG7BPC5VSnVh4fErz6N'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · RentGF' },
  description: DESCRIPTION,
  keywords: ['rent a girlfriend India','companion app India','female companion Delhi','female companion Mumbai','female companion Bengaluru','social companion India','companionship app India','rent girlfriend Delhi','rent girlfriend Mumbai','paid companionship India','platonic companion India','coffee companion India','travel companion India','event companion India','female companion Hyderabad','female companion Chennai','female companion Pune','companionship service India','rentgf'],
  authors: [{ name: 'RentGF', url: SITE_URL }],
  creator: 'RentGF',
  publisher: 'RentGF',
  category: 'Lifestyle',
  alternates: { canonical: '/', languages: { 'en-IN': '/' } },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: OG_IMAGE, width: 1200, height: 675, alt: 'RentGF — Verified Social Companions in India' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [OG_IMAGE], site: '@rentgf_in' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icon.svg',
  },
  verification: { google: '' },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#173f35' },
  ],
}

function JsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, description: DESCRIPTION, inLanguage: 'en-IN', potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/discover?q={search_term_string}` }, 'query-input': 'required name=search_term_string' } },
      { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg` }, sameAs: [], areaServed: { '@type': 'Country', name: 'India' }, description: DESCRIPTION },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <head>
        <JsonLd />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold">Skip to main content</a>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
