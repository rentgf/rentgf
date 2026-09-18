'use client'

const bookingAccessKey = 'rentgf-preview-bookings'

export type BookingAccess = { companionId: string; bookingId: string; createdAt: string }

export function getBookingAccess(): BookingAccess[] {
  if (typeof window === 'undefined') return []
  try {
    const value = window.localStorage.getItem(bookingAccessKey)
    return value ? JSON.parse(value) as BookingAccess[] : []
  } catch {
    return []
  }
}

export function hasBookingAccess(companionId: string) {
  return getBookingAccess().some((booking) => booking.companionId === companionId)
}

export function grantBookingAccess(companionId: string) {
  const existing = getBookingAccess()
  if (existing.some((booking) => booking.companionId === companionId)) return existing
  const next = [...existing, { companionId, bookingId: `preview-${Date.now()}`, createdAt: new Date().toISOString() }]
  window.localStorage.setItem(bookingAccessKey, JSON.stringify(next))
  return next
}
