/// <reference lib="webworker" />
export default null
declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any
}

self.__WB_MANIFEST

const CACHE_NAME = 'offline-cache-v1'
const OFFLINE_PAGE = 'offline.html'

// Install event - cache offline page
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_PAGE)
    })
  )
})

// Clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    })
  )
})

// Serve offline page when network fails
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(OFFLINE_PAGE).then((response) => {
        return (
          response ||
          new Response('Offline page not available', {
            status: 503,
            statusText: 'Service Unavailable'
          })
        )
      })
    })
  )
})
