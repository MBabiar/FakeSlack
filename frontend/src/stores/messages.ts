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

export const useMessagesStore = defineStore('messages', () => {
  const socketStore = useSocketStore()

  const loadingMessages = ref(false)
  const messages = ref<Message[]>([])
  const pagination = ref({ page: 0, pageSize: 20, total: 0, totalPages: 0 })

  const fetchMessagesForChannel = (channelId: number) => {
    return new Promise<void>(async (resolve, reject) => {
      if (socketStore.socket) {
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
      } else {
        console.error('Socket is not connected')
        reject('Socket is not connected')
      }
    })
  }

  const sendMessage = (channelId: number, text: string) => {
    if (socketStore.socket) {
      socketStore.socket.emit('message', { channelId, text })
    } else {
      console.error('Socket is not connected')
    }
  }

  return { messages, loadingMessages, fetchMessagesForChannel, sendMessage, pagination }
})
