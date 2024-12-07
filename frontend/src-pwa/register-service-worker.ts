import { register } from 'register-service-worker'
import { Notify } from 'quasar'

register(process.env.SERVICE_WORKER_FILE as string, {
  ready() {
    console.log('App is being served from cache by a service worker.')
  },
  registered() {
    console.log('Service worker has been registered.')
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
    console.log('No internet connection found. App is running in offline mode.')
    Notify.create({
      message: 'Working offline',
      color: 'warning'
    })
  },
  error(error) {
    console.error('Error during service worker registration:', error)
  }
})
