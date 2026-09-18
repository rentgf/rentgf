export type PreviewBooking = {
  id: string
  companionId: string
  companionName: string
  date: string
  time: string
  duration: string
  activity: string
  amount: number
  status: 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

export type PreviewReview = { id: string; bookingId: string; rating: number; text: string; createdAt: string }

const bookingsKey = 'rentgf-preview-bookings-v2'
const reviewsKey = 'rentgf-preview-reviews'
const notificationsKey = 'rentgf-preview-notifications'

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try { return JSON.parse(window.localStorage.getItem(key) ?? '') as T } catch { return fallback }
}

function write<T>(key: string, value: T) {
  if (typeof window !== 'undefined') window.localStorage.setItem(key, JSON.stringify(value))
}

export function getPreviewBookings() { return read<PreviewBooking[]>(bookingsKey, []) }
export function savePreviewBooking(booking: PreviewBooking) { const next = [booking, ...getPreviewBookings().filter((item) => item.id !== booking.id)]; write(bookingsKey, next); return booking }
export function updatePreviewBooking(id: string, status: PreviewBooking['status']) { const next = getPreviewBookings().map((item) => item.id === id ? { ...item, status } : item); write(bookingsKey, next); return next }
export function getPreviewReviews() { return read<PreviewReview[]>(reviewsKey, []) }
export function savePreviewReview(review: PreviewReview) { const next = [review, ...getPreviewReviews().filter((item) => item.id !== review.id)]; write(reviewsKey, next); return next }
export function addPreviewNotification(title: string, body: string) { const next = [{ id: `notification-${Date.now()}`, title, body, createdAt: new Date().toISOString() }, ...read<Array<{ id: string; title: string; body: string; createdAt: string }>>(notificationsKey, [])]; write(notificationsKey, next); return next }
export function getPreviewNotifications() { return read<Array<{ id: string; title: string; body: string; createdAt: string }>>(notificationsKey, []) }
export const isPreviewMode = true
