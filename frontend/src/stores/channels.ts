import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useIdentityStore } from './identity-store'

interface Channel {
  id: number
  name: string
  private: boolean
  new: boolean
}

export const useChannelsStore = defineStore('channels', () => {
  const identityStore = useIdentityStore()
  const loading = ref(false)
  const socket = identityStore.socket

  const channels = ref<Channel[]>([])
  const selectedChannelId = ref<number | null>(null)

  const loadChannels = () => {
    return new Promise<void>((resolve, reject) => {
      // Listen for the channels event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.on('channels', (receivedChannels: any) => {
        // Update the channels ref
        if (receivedChannels) {
          channels.value = receivedChannels
        } else {
          channels.value = []
        }
        resolve()
      })

      // Listen for error event
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socket.on('error', (errorMessage: any) => {
        console.error('Error:', errorMessage)
        reject(errorMessage)
      })

      socket.emit('getChannels')
    })
  }

  return {
    loading,
    channels,
    loadChannels,
    selectedChannelId
  }
})
