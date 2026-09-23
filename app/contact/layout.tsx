import type { Metadata } from 'next'

// The contact page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the RentGF team for bookings, safety concerns, companion verification, or general questions.',
  alternates: { canonical: '/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
