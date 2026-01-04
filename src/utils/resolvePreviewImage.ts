const CACHE_KEY = 'previewImageCache'
const NONE_SENTINEL = '__NONE__'

function loadCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
function saveCache(cache: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch { /* ignore persistence errors */ }
}

function isValidUrl(url?: string | null): boolean {
  if (!url) return false
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function getCachedPreview(link: string): string | null | undefined {
  const cache = loadCache()
  const value = cache[link]
  if (!value) return undefined
  return value === NONE_SENTINEL ? null : value
}

export async function resolvePreviewImage(link: string, fallbackImageUrl?: string): Promise<string | null> {
  // 1) cache
  const cached = getCachedPreview(link)
  if (cached !== undefined) return cached

  // 2) fallback from data
  if (isValidUrl(fallbackImageUrl)) {
    const cache = loadCache()
    cache[link] = fallbackImageUrl as string
    saveCache(cache)
    return fallbackImageUrl as string
  }

  // 3) best-effort: public preview service (Microlink)
  try {
    const endpoint = 'https://api.microlink.io?url=' + encodeURIComponent(link)
    const res = await fetch(endpoint)
    if (res.ok) {
      const json = await res.json()
      const url: string | undefined = json?.data?.image?.url || json?.data?.logo?.url
      if (isValidUrl(url)) {
        const cache = loadCache()
        cache[link] = url!
        saveCache(cache)
        return url!
      }
    }
  } catch {
    // ignore network/CORS errors
  }

  // 4) cache NONE
  const cache = loadCache()
  cache[link] = NONE_SENTINEL
  saveCache(cache)
  return null
}
