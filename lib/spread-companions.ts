// Number of profiles the Home feed shows. Discover uses the same number to know which ones Home already showed.
export const HOME_FEED_LIMIT = 20
// Discover shows this many profiles first, then a "Show more" button
export const DISCOVER_PAGE_SIZE = 50

// Reorders companions so profiles sharing the same photo never appear close together
// (within `gap` positions). Profiles without a photo are never treated as duplicates.
export function spreadBySamePhoto<T extends { profile_photo_url: string | null }>(items: T[], gap = 4): T[] {
  const remaining = [...items]
  const result: T[] = []
  while (remaining.length) {
    const recent = new Set(
      result.slice(-gap).map((item) => item.profile_photo_url).filter((url): url is string => !!url),
    )
    const index = remaining.findIndex((item) => !item.profile_photo_url || !recent.has(item.profile_photo_url))
    // If every remaining profile clashes, fall back to the next one so nothing is dropped
    result.push(...remaining.splice(index === -1 ? 0 : index, 1))
  }
  return result
}

// `items` must be in the same order Home uses (rating desc, then id). The first HOME_FEED_LIMIT
// are the ones Home already showed, so they move to the end and Discover leads with fresh profiles.
export function pushHomeProfilesDown<T>(items: T[]): T[] {
  return [...items.slice(HOME_FEED_LIMIT), ...items.slice(0, HOME_FEED_LIMIT)]
}
