import type { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import CompanionProfileClient from './_client'

const SITE_URL = 'https://rentgf.site'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  )

  const { data } = await supabase
    .from('public_companion_profiles')
    .select('bio, city, starting_price, avg_rating, display_name, profile_photo_url')
    .eq('id', id)
    .single()

  if (!data) {
    return { title: 'Companion Not Found · RentGF' }
  }

  const name = data.display_name ?? 'Companion'
  const city = data.city ?? 'India'
  const price = data.starting_price ? `₹${data.starting_price.toLocaleString('en-IN')}/hr` : ''
  const rating = data.avg_rating ? ` · ★ ${Number(data.avg_rating).toFixed(1)}` : ''
  const title = `${name} — Verified Companion in ${city} · RentGF`
  const description = `Book ${name}, a verified companion in ${city}${price ? ` from ${price}` : ''}${rating}. ${data.bio?.slice(0, 120) ?? 'Safe, lawful, non-sexual social companionship.'}`

  return {
    title,
    description,
    alternates: { canonical: `/companions/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/companions/${id}`,
      images: data.profile_photo_url ? [{ url: data.profile_photo_url, width: 800, height: 800, alt: name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.profile_photo_url ? [data.profile_photo_url] : [],
    },
  }
}

export default async function CompanionProfilePage({ params }: Props) {
  const { id } = await params
  return <CompanionProfileClient id={id} />
}
