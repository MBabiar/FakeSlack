import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSocket } from 'src/stores/socket'
import { useIdentityStore } from './identity-store'

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
  const identityStore = useIdentityStore()

  const fetchMessagesForChannel = (channelId: number) => {
    return new Promise<void>((resolve, reject) => {
      const socket = getSocket()
      if (socket) {
        socket.on('messages', (receivedMessages) => {
          console.log('Received messages:', receivedMessages)

          // Extract name and text and assign to messages ref
          messages.value[channelId] = receivedMessages.map(
            (message: {
              id: number
              channelId: number
              author: { id: number; nickname: string }
              content: string
              createdAt: string
            }) => ({
              id: message.id,
              channelId: message.channelId,
              name: message.author.nickname,
              text: [message.content],
              me: message.author.id === identityStore.id
            })
          )
          resolve()
        })

        socket.on('error', (errorMessage: string) => {
          console.error('Error:', errorMessage)
          reject(errorMessage)
        })

        socket.emit('getMessages', { channelId })
      } else {
        console.error('Socket is not connected')
        reject('Socket is not connected')
      }
    })
  }

  return { messages, fetchMessagesForChannel }
})
