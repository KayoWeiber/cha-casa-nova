// Best-effort image processing: fetch via proxy, remove solid background, convert to PNG,
// and cache results. Falls back to original image on failures.

const CACHE_DB_NAME = 'imageCacheDB'
const CACHE_STORE_NAME = 'processedPNG'
const LS_CACHE_KEY = 'processedPngCache'

export type BgSampleMode = 'corners' | 'border'

export type ProcessOptions = {
  removeBg?: boolean
  bgTolerance?: number // 0-255 distance threshold
  bgSample?: BgSampleMode
}

function defaults(opts?: ProcessOptions): Required<ProcessOptions> {
  return {
    removeBg: opts?.removeBg ?? true,
    bgTolerance: opts?.bgTolerance ?? 35,
    bgSample: opts?.bgSample ?? 'corners',
  }
}

function loadLocalStorageCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LS_CACHE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
function saveLocalStorageCache(cache: Record<string, string>) {
  try { localStorage.setItem(LS_CACHE_KEY, JSON.stringify(cache)) } catch {}
}

function hashKey(url: string): string {
  // simple stable key
  return `v1:${url}`
}

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CACHE_DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
        db.createObjectStore(CACHE_STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
async function idbGet(key: string): Promise<string | undefined> {
  try {
    const db = await openDB()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE_NAME, 'readonly')
      const store = tx.objectStore(CACHE_STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result as string | undefined)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return undefined
  }
}
async function idbSet(key: string, value: string): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(CACHE_STORE_NAME, 'readwrite')
      const store = tx.objectStore(CACHE_STORE_NAME)
      const req = store.put(value, key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    // ignore
  }
}

export async function getCachedProcessed(url: string): Promise<string | undefined> {
  const key = hashKey(url)
  // try idb
  const idbVal = await idbGet(key)
  if (idbVal) return idbVal
  // try localStorage
  const ls = loadLocalStorageCache()
  return ls[key]
}

export async function setCachedProcessed(url: string, dataUrl: string): Promise<void> {
  const key = hashKey(url)
  // try idb
  await idbSet(key, dataUrl)
  // fallback to LS for small payloads
  if (dataUrl.length < 500_000) {
    const ls = loadLocalStorageCache()
    ls[key] = dataUrl
    saveLocalStorageCache(ls)
  }
}

// Fetch through proxy to avoid CORS taint
async function fetchViaProxy(imageUrl: string): Promise<Blob> {
  const endpoint = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
  const res = await fetch(endpoint)
  if (!res.ok) throw new Error('Proxy fetch failed')
  return await res.blob()
}

function sampleBackgroundColor(img: CanvasImageSource, w: number, h: number, ctx: CanvasRenderingContext2D, mode: BgSampleMode): [number, number, number] {
  // draw image to sample
  ctx.drawImage(img as any, 0, 0, w, h)
  const samples: [number, number, number][] = []
  const get = (x: number, y: number) => {
    const d = ctx.getImageData(x, y, 1, 1).data
    return [d[0], d[1], d[2]] as [number, number, number]
  }
  const pushCorner = (x: number, y: number) => {
    samples.push(get(x, y))
    samples.push(get(Math.min(x+1, w-1), y))
    samples.push(get(x, Math.min(y+1, h-1)))
  }
  if (mode === 'corners') {
    pushCorner(0, 0)
    pushCorner(w-1, 0)
    pushCorner(0, h-1)
    pushCorner(w-1, h-1)
  } else {
    for (let x = 0; x < w; x += Math.max(1, Math.floor(w/16))) samples.push(get(x, 0))
    for (let x = 0; x < w; x += Math.max(1, Math.floor(w/16))) samples.push(get(x, h-1))
    for (let y = 0; y < h; y += Math.max(1, Math.floor(h/16))) samples.push(get(0, y))
    for (let y = 0; y < h; y += Math.max(1, Math.floor(h/16))) samples.push(get(w-1, y))
  }
  // average color
  const sum = samples.reduce((acc, [r,g,b]) => [acc[0]+r, acc[1]+g, acc[2]+b], [0,0,0])
  const avg: [number, number, number] = [Math.round(sum[0]/samples.length), Math.round(sum[1]/samples.length), Math.round(sum[2]/samples.length)]
  return avg
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  const dr = a[0]-b[0], dg = a[1]-b[1], db = a[2]-b[2]
  return Math.sqrt(dr*dr + dg*dg + db*db)
}

export async function processImageToPng(imageUrl: string, opts?: ProcessOptions): Promise<string> {
  const cached = await getCachedProcessed(imageUrl)
  if (cached) return cached

  const options = defaults(opts)

  // Fetch blob via proxy
  let blob: Blob
  try {
    blob = await fetchViaProxy(imageUrl)
  } catch (err) {
    // fallback: return original url (no processing)
    return imageUrl
  }

  // create bitmap or image element
  let imgBitmap: ImageBitmap | null = null
  let imgEl: HTMLImageElement | null = null
  try {
    if ('createImageBitmap' in window) {
      imgBitmap = await createImageBitmap(blob)
    } else {
      imgEl = new Image()
      imgEl.src = URL.createObjectURL(blob)
      await new Promise<void>((resolve, reject) => {
        imgEl!.onload = () => resolve()
        imgEl!.onerror = () => reject(new Error('Image load failed'))
      })
    }
  } catch {
    // cannot decode, fallback
    return imageUrl
  }

  const w = (imgBitmap?.width ?? imgEl!.naturalWidth) || 0
  const h = (imgBitmap?.height ?? imgEl!.naturalHeight) || 0
  if (!w || !h) return imageUrl

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!

  // draw initial image
  if (imgBitmap) ctx.drawImage(imgBitmap, 0, 0)
  else ctx.drawImage(imgEl!, 0, 0)

  // remove solid background if enabled
  if (options.removeBg) {
    const bg = sampleBackgroundColor(imgBitmap ?? imgEl!, w, h, ctx, options.bgSample)
    const imgData = ctx.getImageData(0, 0, w, h)
    const data = imgData.data
    const tol = options.bgTolerance
    // simple feather radius
    const feather = 1.5
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2]
      const dist = colorDistance([r,g,b], bg)
      if (dist <= tol) {
        // set transparent, with slight feather based on distance
        const alpha = Math.max(0, Math.min(255, Math.round((dist/tol) * 255)))
        data[i+3] = Math.min(data[i+3], alpha * feather)
      }
    }
    ctx.putImageData(imgData, 0, 0)
  }

  // export PNG
  const dataUrl = canvas.toDataURL('image/png')
  // cache
  try { await setCachedProcessed(imageUrl, dataUrl) } catch {}
  return dataUrl
}
