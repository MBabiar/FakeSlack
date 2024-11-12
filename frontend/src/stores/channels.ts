import { defineStore } from 'pinia'
import { ref } from 'vue'
import { connectSocket } from 'src/stores/socket'

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref([
    {
      id: 10,
      name: 'Foodies United',
      private: false,
      new: false
    }
  ])

  const loadChannels = () => {
    return new Promise<void>((resolve, reject) => {
      // Fetch channels from the server
      const socket = connectSocket()
      if (!socket) {
        reject('Socket is not connected')
        return
      }
      socket.emit('getChannels')

      // Listen for the channels event
      socket.on('channels', (receivedChannels) => {
        // Update the channels ref
        if (receivedChannels) {
          channels.value = receivedChannels
        } else {
          channels.value = [
            {
              id: 10,
              name: 'Foodies United',
              private: false,
              new: false
            }
          ]
        }
        resolve()
      })

      // Listen for error event
      socket.on('error', (errorMessage) => {
        console.error('Error:', errorMessage)
        reject(errorMessage)
      })
    })
  }

  return { channels, loadChannels }
})
