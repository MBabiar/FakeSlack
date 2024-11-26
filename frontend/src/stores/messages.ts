import { defineStore } from 'pinia'
import { ref } from 'vue'
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
  const socket = identityStore.socket

  const fetchMessagesForChannel = (channelId: number) => {
    return new Promise<void>((resolve, reject) => {
      if (socket) {
        socket.emit('joinChannel', { channelId })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socket.on('messages', (receivedMessages: any) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket.on('newMessage', (newMessage: any) => {
    console.log('New message:', newMessage)
    const message = {
      id: newMessage.id,
      channelId: newMessage.channelId,
      userId: newMessage.author.id,
      name: newMessage.author.nickname,
      text: [newMessage.content],
      createdAt: newMessage.createdAt,
      me: newMessage.author.id === identityStore.id
    }

    messages.value[message.channelId].push(message)
  })

  const sendMessage = (channelId: number, text: string) => {
    if (socket) {
      socket.emit('message', { channelId, text })
    } else {
      console.error('Socket is not connected')
    }
  }

  return { messages, fetchMessagesForChannel, sendMessage }
})
