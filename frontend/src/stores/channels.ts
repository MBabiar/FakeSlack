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

  const channels = ref<Channel[]>([])

  const loadChannelss = () => {
    loading.value = true
    console.log('Fetching channels...')
    identityStore.socket.emit('getChannels')

    identityStore.socket.on('channels', (data: unknown) => {
      console.log('Got channels:', data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const channelsMapped = (data as any[]).map((channel) => {
        return {
          id: channel.id,
          name: channel.name,
          private: channel.private,
          new: false
        }
      })
      channels.value = channelsMapped
      loading.value = false
    })
  }

  const loadChannels = () => {
    return new Promise<void>((resolve, reject) => {
      // Fetch channels from the server
      const socket = identityStore.socket

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
    loadChannelss
  }
})
