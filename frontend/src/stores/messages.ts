import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSocket } from 'src/stores/socket'

interface Message {
  id: number
  channelId: number
  userId: number
  name: string
  text: string[]
  createdAt: string
  me: boolean
}

export const useMessagesStore = defineStore('messages', () => {
  const messages = ref<{ [channelId: number]: Message[] }>({})

  const fetchMessagesForChannel = (channelId: number) => {
    return new Promise<void>((resolve, reject) => {
      const socket = getSocket()
      if (socket) {
        socket.emit('getMessages', { channelId })

        socket.on('messages', (receivedMessages: Message[]) => {
          console.log('Received messages:', receivedMessages)
          receivedMessages.forEach((message) => {
            if (!messages.value[message.channelId]) {
              messages.value[message.channelId] = []
            }
            messages.value[message.channelId].push(message)
          })
          // Ensure reactivity
          messages.value = { ...messages.value }
          resolve()
        })

        socket.on('error', (errorMessage: string) => {
          console.error('Error:', errorMessage)
          reject(errorMessage)
        })
      } else {
        console.error('Socket is not connected')
        reject('Socket is not connected')
      }
    })
  }

  return { messages, fetchMessagesForChannel }
})
