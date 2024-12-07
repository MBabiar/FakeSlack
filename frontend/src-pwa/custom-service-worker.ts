import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any[]
}

// Precache all webpack-generated assets
precacheAndRoute(self.__WB_MANIFEST)

// Cache API requests
registerRoute(
  ({ url }) => url.pathname.startsWith('/api'),
  new NetworkFirst({
    cacheName: 'api-cache'
  })
)

// Cache static assets
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-resources'
  })
)
