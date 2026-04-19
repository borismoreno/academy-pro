const CACHE_VERSION = 'v1'
const STATIC_CACHE = `cancha360-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `cancha360-dynamic-${CACHE_VERSION}`

const STATIC_ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith('cancha360-') &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE
          )
          .map((name) => caches.delete(name))
      ).then(() => self.clients.claim())
    })
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (event.request.method !== 'GET') return
  if (url.pathname.includes('/api/')) return
  if (url.origin !== self.location.origin) return
  if (event.request.url.includes('sentry.io')) return

  if (url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request)
        if (cached) return cached
        const response = await fetch(event.request)
        if (response.status === 200) {
          cache.put(event.request, response.clone())
        }
        return response
      })
    )
    return
  }

  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        if (response.status === 200) {
          const cache = await caches.open(DYNAMIC_CACHE)
          cache.put(event.request, response.clone())
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(event.request)
        if (cached) return cached
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html', { cacheName: DYNAMIC_CACHE })
        }
        return undefined
      })
  )
})
