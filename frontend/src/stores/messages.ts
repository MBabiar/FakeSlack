import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSocketStore } from './socket'

interface Message {
  id: number
  channelId: number
  userId: number
  name: string
  text: string[]
  createdAt: string
  me: boolean
}

interface typingMember {
  userNickname: string
  text: string
  timeoutId: NodeJS.Timeout
}

export const useMessagesStore = defineStore('messages', () => {
  const socketStore = useSocketStore()

  const loadingMessages = ref(false)
  const messages = ref<Message[]>([])
  const typingMembers = ref<typingMember[]>([])
  const pagination = ref({ page: 0, pageSize: 20, total: 0, totalPages: 0 })

  const fetchMessagesForChannel = (channelId: number) => {
    return new Promise<void>(async (resolve, reject) => {
      let attempts = 0
      const maxAttempts = 5

      while (!socketStore.socket && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        attempts++
      }

      if (!socketStore.socket) {
        reject(new Error('Socket connection not available after retry attempts'))
        return
      }

      const errorHandler = (errorMessage: string) => {
        console.error('Error:', errorMessage)
        reject(errorMessage)
      }
      socketStore.socket.once('error', errorHandler)

      loadingMessages.value = true
      socketStore.socket.emit('getMessages', {
        channelId,
        page: pagination.value.page + 1,
        pageSize: pagination.value.pageSize
      })

      while (loadingMessages.value) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      socketStore.socket.off('error', errorHandler)
      resolve()
    })
  }

  const sendMessage = (channelId: number, text: string) => {
    if (socketStore.socket) {
      socketStore.socket.emit('sendMessage', { channelId, text })
    } else {
      console.error('Socket is not connected')
    }
  }

  const sendTyping = (channelId: number, text: string) => {
    if (socketStore.socket) {
      socketStore.socket.emit('sendTyping', { channelId, text })
    } else {
      console.error('Socket is not connected')
    }
  }

  return {
    messages,
    loadingMessages,
    pagination,
    typingMembers,
    fetchMessagesForChannel,
    sendMessage,
    sendTyping
  }
})
