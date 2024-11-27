import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { ref } from 'vue'
import { useIdentityStore } from './identity-store'
import { useMessagesStore } from './messages'
import { useChannelsStore } from './channels'

export const useSocketStore = defineStore('socket', () => {
  const identityStore = useIdentityStore()
  const messagesStore = useMessagesStore()
  const channelStore = useChannelsStore()

  const socket = ref()

  const establishSocketConnection = () => {
    console.log('establishing socket connection')
    const sock = io('http://localhost:3333', { auth: { token: identityStore.token } })
    socket.value = sock
    defineSocketListeners()
  }

  const defineSocketListeners = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.value.on('channels', (receivedChannels: any) => {
      // Update the channels ref
      if (receivedChannels) {
        channelStore.channels = receivedChannels
        channelStore.loadingChannels = false
      } else {
        channelStore.channels = []
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.value.on('messages', (receivedMessages: any) => {
      // Extract name and text and assign to messages ref
      messagesStore.pagination = {
        page: receivedMessages.pagination.page,
        pageSize: receivedMessages.pagination.pageSize,
        total: receivedMessages.pagination.total,
        totalPages: receivedMessages.pagination.totalPages
      }
      const newMessages = receivedMessages.data.map(
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

      messagesStore.messages = [...newMessages, ...messagesStore.messages].filter(
        (message, index, self) => index === self.findIndex((m) => m.id === message.id)
      )
      messagesStore.loadingMessages = false
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.value.on('newMessage', (newMessage: any) => {
      const message = {
        id: newMessage.id,
        channelId: newMessage.channelId,
        userId: newMessage.author.id,
        name: newMessage.author.nickname,
        text: [newMessage.content],
        createdAt: newMessage.createdAt,
        me: newMessage.author.id === identityStore.id
      }

      messagesStore.messages.push(message)
    })
  }

  return {
    socket,
    establishSocketConnection
  }
})
