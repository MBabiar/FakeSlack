import { register } from 'register-service-worker'
import { Notify } from 'quasar'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker controller changed')
  })

  navigator.serviceWorker.register('/custom-service-worker.js')
  // Request notification permission
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted')
    }
  })
}

register(process.env.SERVICE_WORKER_FILE as string, {
  ready() {
    console.log('App is being served from cache by a service worker.')
  },
  registered(registration) {
    console.log('Service worker registered:', registration)

    // Store this context
    const self = this

    // Listen for online events
    window.addEventListener('online', () => {
      // Simple redirect when coming back online
      window.location.href = '/index'
      Notify.create({
        message: 'Back online',
        color: 'positive'
      })
    })

    // Listen for offline events
    window.addEventListener('offline', () => {
      registration.active?.postMessage({ type: 'OFFLINE_EVENT' })
      // Check if offline handler exists before calling
      if (typeof self.offline === 'function') {
        self.offline()
      }
    })
  },
  cached() {
    console.log('Content has been cached for offline use.')
    Notify.create({
      message: 'App ready for offline use',
      color: 'positive'
    })
  },
  updatefound() {
    console.log('New content is downloading.')
  },
  updated() {
    console.log('New content is available; please refresh.')

    // Clear all caches including precache
    Promise.all([
      // Clear all caches
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),

      // Unregister service worker
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          registration.unregister()
        }
      })
    ]).then(() => {
      console.log('Caches cleared and service worker unregistered')
      // window.location.reload()
      Notify.create({
        message: 'New content loaded.',
        color: 'positive'
      })
    })
  },
  offline() {
    console.log('ServiceWorker: Offline mode detected')
    Notify.create({
      message: 'Working offline (Service Worker)',
      color: 'warning',
      position: 'top',
      timeout: 2000
    })
    // Redirect to offline page after 2 seconds
    setTimeout(() => {
      if (!navigator.onLine) {
        window.location.href = '/offline'
      }
    }, 2000)
  },
  error(error) {
    console.error('Error during service worker registration:', error)
  }
})
