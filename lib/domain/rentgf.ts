export type Role = 'customer' | 'companion' | 'admin'
export type VerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'suspended'
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'confirmed' | 'cancelled' | 'completed' | 'disputed' | 'refunded'

export type City = { id: string; name: string; slug: string; active: boolean; order: number }
export type Category = { id: string; name: string; slug: string; active: boolean; order: number }
export type Interest = { id: string; name: string; slug: string; active: boolean; order: number }
export type Companion = {
  id: string; displayName: string; city: City; bio: string; photoUrl: string
  languages: string[]; interests: Interest[]; categories: Category[]; startingPrice: number
  rating: number; reviewCount: number; verification: VerificationStatus; active: boolean; visible: boolean
}
export type PlatformSettings = {
  accessFee: number; currency: string; accessEnabled: boolean; accessDescription: string
  commissionPercent: number; botEnabled: boolean; botName: string; welcomeMessage: string
  supportEmail: string; refundPolicy: string; cancellationPolicy: string
}

export const cities: City[] = [
  { id: 'city-mum', name: 'Mumbai', slug: 'mumbai', active: true, order: 1 },
  { id: 'city-del', name: 'Delhi', slug: 'delhi', active: true, order: 2 },
  { id: 'city-blr', name: 'Bengaluru', slug: 'bengaluru', active: true, order: 3 },
  { id: 'city-pun', name: 'Pune', slug: 'pune', active: true, order: 4 },
]
export const categories: Category[] = [
  { id: 'cat-coffee', name: 'Coffee & conversation', slug: 'coffee-conversation', active: true, order: 1 },
  { id: 'cat-dining', name: 'Dining', slug: 'dining', active: true, order: 2 },
  { id: 'cat-events', name: 'Events', slug: 'events', active: true, order: 3 },
  { id: 'cat-culture', name: 'Culture & sightseeing', slug: 'culture-sightseeing', active: true, order: 4 },
]
export const interests: Interest[] = ['Art', 'Books', 'Food', 'Fitness', 'Music', 'Travel'].map((name, index) => ({ id: `interest-${index}`, name, slug: name.toLowerCase(), active: true, order: index + 1 }))
export const companions: Companion[] = [
  { id: 'c1', displayName: 'Aanya', city: cities[0], bio: 'Easy conversation, thoughtful company, and a good eye for the best cafés in the city.', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85', languages: ['English', 'Hindi'], interests: [interests[0], interests[2]], categories: [categories[0], categories[3]], startingPrice: 999, rating: 4.9, reviewCount: 28, verification: 'approved', active: true, visible: true },
  { id: 'c2', displayName: 'Meera', city: cities[1], bio: 'Warm, curious and always up for a gallery visit, a long walk, or trying somewhere new.', photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85', languages: ['English', 'Hindi', 'Punjabi'], interests: [interests[0], interests[4]], categories: [categories[2], categories[3]], startingPrice: 1299, rating: 4.8, reviewCount: 19, verification: 'approved', active: true, visible: true },
  { id: 'c3', displayName: 'Ira', city: cities[2], bio: 'For board games, indie music, and low-key plans with great conversation.', photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=85', languages: ['English', 'Kannada'], interests: [interests[1], interests[4]], categories: [categories[0], categories[2]], startingPrice: 899, rating: 5, reviewCount: 34, verification: 'approved', active: true, visible: true },
]
export const platformSettings: PlatformSettings = { accessFee: 499, currency: 'INR', accessEnabled: true, accessDescription: 'One-time access to discover and connect on RentGF.', commissionPercent: 15, botEnabled: true, botName: 'RentGF guide', welcomeMessage: 'Hi, I’m the RentGF automated guide. Ask me about bookings, pricing, safety, or using the platform.', supportEmail: 'support@rentgf.site', refundPolicy: 'Refunds are reviewed under the applicable cancellation policy. A refund is only marked complete after the payment provider confirms it.', cancellationPolicy: 'Cancellation terms are shown before you submit a booking and depend on the booking status and timing.' }

export function calculateAccessPrice(settings: PlatformSettings, discount?: { type: 'percentage' | 'fixed'; value: number; active: boolean }) {
  const original = settings.accessFee
  if (!discount?.active) return { original, discount: 0, final: original }
  const amount = discount.type === 'percentage' ? Math.round(original * discount.value / 100) : discount.value
  return { original, discount: Math.min(amount, original), final: Math.max(0, original - amount) }
}

export function canTransitionBooking(from: BookingStatus, to: BookingStatus) {
  const transitions: Record<BookingStatus, BookingStatus[]> = { pending: ['accepted', 'rejected', 'cancelled'], accepted: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled', 'disputed'], rejected: [], cancelled: ['refunded'], completed: ['disputed'], disputed: ['refunded'], refunded: [] }
  return transitions[from].includes(to)
}

export function filterCompanions(query: string, city?: string, category?: string) {
  const normalized = query.trim().toLowerCase()
  return companions.filter((companion) => {
    const text = [companion.displayName, companion.bio, companion.city.name, ...companion.languages, ...companion.interests.map((i) => i.name), ...companion.categories.map((c) => c.name)].join(' ').toLowerCase()
    return companion.visible && companion.active && companion.verification === 'approved' && (!normalized || text.includes(normalized)) && (!city || companion.city.slug === city) && (!category || companion.categories.some((item) => item.slug === category))
  })
}
