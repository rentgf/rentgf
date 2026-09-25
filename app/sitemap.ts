import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://rentgf.site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cities = [
    'agra', 'ahmedabad', 'ajmer', 'aligarh', 'alwar', 'amravati', 'amritsar', 'anand', 'asansol', 'aurangabad',
    'bareilly', 'bardhaman', 'bathinda', 'belagavi', 'bengaluru', 'berhampur', 'bharatpur', 'bharuch', 'bhavnagar', 'bhilwara', 'bhopal', 'bhubaneswar', 'bikaner', 'bokaro',
    'chennai', 'coimbatore', 'cuttack',
    'darjeeling', 'davangere', 'delhi', 'deoghar', 'dewas', 'dhanbad', 'dindigul', 'dibrugarh', 'durgapur',
    'erode',
    'faridabad',
    'gandhinagar', 'gandhidham', 'gaya', 'ghaziabad', 'gorakhpur', 'gulbarga', 'guntur', 'gurgaon', 'guwahati', 'gwalior',
    'hazaribagh', 'hisar', 'howrah', 'hubli', 'hyderabad',
    'indore',
    'jabalpur', 'jaipur', 'jalandhar', 'jamnagar', 'jamshedpur', 'jodhpur', 'jorhat', 'junagadh',
    'kakinada', 'kanchipuram', 'kanpur', 'karimnagar', 'karnal', 'khammam', 'kochi', 'kolkata', 'kollam', 'kota', 'kottayam', 'kozhikode', 'kurnool',
    'lucknow', 'ludhiana',
    'madurai', 'mahbubnagar', 'malda', 'mangalore', 'meerut', 'mohali', 'moradabad', 'mumbai', 'muzaffarpur', 'mysuru',
    'nadiad', 'nagaon', 'nagpur', 'nashik', 'navi-mumbai', 'nellore', 'nizamabad', 'noida',
    'palakkad', 'panipat', 'pathankot', 'patna', 'patiala', 'prayagraj', 'pune', 'puri', 'purnia',
    'rajahmundry', 'rajkot', 'ramagundam', 'ranchi', 'ratlam', 'rewa', 'rohtak', 'rourkela',
    'sagar', 'salem', 'sambalpur', 'satna', 'sikar', 'silchar', 'siliguri', 'solapur', 'sonipat', 'surat',
    'thane', 'thiruvananthapuram', 'thoothukudi', 'tinsukia', 'tiruchirappalli', 'tirunelveli', 'tirupati', 'tiruppur', 'thrissur', 'tumkur',
    'udaipur', 'udupi', 'ujjain',
    'vadodara', 'varanasi', 'vellore', 'vijayawada', 'visakhapatnam',
    'warangal',
  ]

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/discover`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/become-companion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/safety`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const cityPages: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${SITE_URL}/discover?city=${city}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch approved visible companion profiles for individual page URLs
  let companionPages: MetadataRoute.Sitemap = []
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data } = await supabase
      .from('companion_profiles')
      .select('id, updated_at')
      .eq('verification_status', 'approved')
      .eq('is_visible', true)
      .limit(200)
    companionPages = (data ?? []).map((cp) => ({
      url: `${SITE_URL}/companions/${cp.id}`,
      lastModified: cp.updated_at ? new Date(cp.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))
  } catch {
    // Silently skip companion pages if DB is unreachable at build time
  }

  return [...staticPages, ...cityPages, ...companionPages]
}
