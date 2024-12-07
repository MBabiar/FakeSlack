import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSocketStore } from './socket'
import axios from 'axios'
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

interface typingMember {
  userNickname: string
  text: string
  timeoutId: NodeJS.Timeout
}

export const useMessagesStore = defineStore('messages', () => {
  const socketStore = useSocketStore()
  const identityStore = useIdentityStore()

  const messages = ref<Message[]>([])
  const typingMembers = ref<typingMember[]>([])
  const pagination = ref({ page: 0, pageSize: 20, total: 0, totalPages: 0 })

  const fetchMessagesForChannel = async (channelId: number) => {
    const fetchPage = pagination.value.page + 1
    try {
      const response = await axios.get(
        `http://localhost:3333/channel/messages/${channelId}/${fetchPage}`
      )

      if (response.status !== 200) {
        console.error('Error:', response.data)
        return
      }

      const paginationResp = response.data.pagination
      const messagesResp = response.data.messages

      pagination.value = {
        page: paginationResp.page as number,
        pageSize: paginationResp.pageSize,
        total: paginationResp.total,
        totalPages: paginationResp.totalPages
      }

      const newMessages = messagesResp.map(
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

      messages.value = [...newMessages, ...messages.value].filter(
        (message, index, self) => index === self.findIndex((m) => m.id === message.id)
      )
    } catch (error) {
      console.error('Error:', error)
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
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
    pagination,
    typingMembers,
    fetchMessagesForChannel,
    sendMessage,
    sendTyping
  }
})
