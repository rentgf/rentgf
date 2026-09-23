import type { Metadata } from 'next'

const SITE_URL = 'https://rentgf.site'

export const metadata: Metadata = {
  title: 'Discover Companions',
  description:
    'Find verified female companions in Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Pune and more. Book for coffee, dining, events, and travel. Safe and lawful. 18+.',
  keywords: [
    'find companion India',
    'female companion near me',
    'companion Delhi',
    'companion Mumbai',
    'companion Bengaluru',
    'companion Hyderabad',
    'companion Chennai',
    'companion Pune',
    'social companion booking India',
    'rent companion India',
  ],
  alternates: { canonical: '/discover' },
  openGraph: {
    title: 'Discover Companions · RentGF',
    description: 'Browse verified companions in your city. Book for coffee, dining, travel, and more.',
    url: `${SITE_URL}/discover`,
  },
}

export { default } from './_page'
