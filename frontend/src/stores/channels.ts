import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useIdentityStore } from './identity-store'
import { connectSocket } from 'src/stores/socket'

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
      const socket = connectSocket()
      if (!socket) {
        reject('Socket is not connected')
        return
      }

      // Listen for the channels event
      socket.on('channels', (receivedChannels) => {
        // Update the channels ref
        if (receivedChannels) {
          channels.value = receivedChannels
        } else {
          channels.value = []
        }
        resolve()
      })

      // Listen for error event
      socket.on('error', (errorMessage) => {
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
