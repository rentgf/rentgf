import { companions } from '@/lib/domain/rentgf'

const storageKey = 'rentgf-saved-companions'
const savedIds = new Set<string>()
let hydrated = false

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(storageKey) ?? '[]')
    if (Array.isArray(stored)) stored.filter((id): id is string => typeof id === 'string').forEach((id) => savedIds.add(id))
  } catch {
    // Keep the empty state if browser storage is unavailable.
  }
}

function persist() {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(storageKey, JSON.stringify([...savedIds]))
}

export function toggleFavorite(id: string) {
  hydrate()
  if (savedIds.has(id)) savedIds.delete(id)
  else savedIds.add(id)
  persist()
  return savedIds.has(id)
}

export function isFavorite(id: string) {
  hydrate()
  return savedIds.has(id)
}

export function getFavoriteCompanions() {
  hydrate()
  return companions.filter((person) => savedIds.has(person.id))
}
