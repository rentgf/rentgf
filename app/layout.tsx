import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://rentgf.example'),
  title: { default: 'RentGF — Good company for real life', template: '%s · RentGF' },
  description: 'Meet verified adults for lawful, non-sexual social companionship in your city.',
  generator: 'RentGF',
  alternates: { canonical: '/' },
  openGraph: { title: 'RentGF — Good company for real life', description: 'Thoughtful company, on your terms.', type: 'website', siteName: 'RentGF' },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><a href="/age-check" className="sr-only focus:not-sr-only">Age confirmation</a>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
