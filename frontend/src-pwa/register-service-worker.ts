import { register } from 'register-service-worker'
import { Notify } from 'quasar'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker controller changed')
  })
}

if ('Notification' in window) {
  Notification.requestPermission()
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
    Notify.create({
      message: 'New content available, please refresh',
      color: 'info',
      actions: [
        {
          label: 'Refresh',
          handler: () => {
            window.location.reload()
          }
        }
      ]
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
