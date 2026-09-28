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
