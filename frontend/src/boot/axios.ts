// frontend/src/boot/axios.ts
import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { useNetworkStore } from 'src/stores/network-store'
import { Notify } from 'quasar'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default boot(({ app }) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const networkStore = useNetworkStore()

      if (!networkStore.isOnline || error.message === 'Network Error') {
        // Handle offline error
        Notify.create({
          message: 'Cannot perform action while offline',
          color: 'negative'
        })
      }
      return Promise.reject(error)
    }
  )
})
