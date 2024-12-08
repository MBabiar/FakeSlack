// frontend/src/stores/network-store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'

export const useNetworkStore = defineStore('network', () => {
  const isOnline = ref(navigator.onLine)

  const updateOnlineStatus = () => {
    isOnline.value = navigator.onLine
    Notify.create({
      message: isOnline.value ? 'Back online' : 'You are offline',
      color: isOnline.value ? 'positive' : 'warning',
      position: 'top'
    })
  }

  // Listen for network status changes
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)

  return {
    isOnline
  }
})
