import type { MetadataRoute } from 'next'

const SITE_URL = 'https://rentgf.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const cities = [
    'delhi', 'mumbai', 'bengaluru', 'hyderabad', 'chennai',
    'kolkata', 'pune', 'jaipur', 'ahmedabad', 'surat',
  ]

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/discover`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/become-companion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${SITE_URL}/discover?city=${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...cityPages]
}
