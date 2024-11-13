import { defineStore } from 'pinia'
import { ref } from 'vue'
import { connectSocket } from 'src/stores/socket'

interface Channel {
  id: number
  name: string
  private: boolean
  new: boolean
}

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref<Channel[]>([])

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

  return { channels, loadChannels }
})
