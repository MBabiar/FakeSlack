import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMessagesStore } from './messages'
import { useSocketStore } from './socket'
import axios from 'axios'
import { Notify } from 'quasar'

interface Channel {
  id: number
  name: string
  private: boolean
  new: boolean
}

export const useChannelsStore = defineStore('channels', () => {
  const messagesStore = useMessagesStore()
  const socketStore = useSocketStore()

  const loadingChannels = ref(false)
  const channels = ref<Channel[]>([])
  const selectedChannelId = ref<number | null>(null)

  const selectChannel = async (channelId: number) => {
    messagesStore.pagination.page = 0
    messagesStore.messages = []
    leaveChannelSocket(selectedChannelId.value)
    joinChannelSocket(channelId)
    await messagesStore.fetchMessagesForChannel(channelId)
    selectedChannelId.value = channelId
  }

  const leaveChannelSocket = (channelId: number | null) => {
    if (socketStore.socket && channelId !== null) {
      socketStore.socket.emit('leaveChannel', { channelId })
    }
  }

  const joinChannelSocket = (channelId: number) => {
    if (socketStore.socket) {
      socketStore.socket.emit('joinChannel', { channelId })
    } else {
      console.error('Socket is not connected')
    }
  }

  const loadChannels = () => {
    return new Promise<void>(async (resolve, reject) => {
      const errorHandler = (errorMessage: string) => {
        console.error('Error:', errorMessage)
        reject(errorMessage)
      }

      socketStore.socket.once('error', errorHandler)

      loadingChannels.value = true
      socketStore.socket.emit('getChannels')
      while (loadingChannels.value) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      socketStore.socket.off('error', errorHandler)
      resolve()
    })
  }

  const leaveChannel = async (channelId: number) => {
    const response = await axios.delete(`http://localhost:3333/channel/leave/${channelId}`)
    if (response.status === 200) {
      if (response.data.message === 'Channel deleted') {
        Notify.create({
          type: 'positive',
          message: 'Channel deleted',
          position: 'top'
        })
      }
      if (response.data.message === 'User left channel') {
        Notify.create({
          type: 'positive',
          message: 'You left channel',
          position: 'top'
        })
      }
    }
    return
  }

  return {
    channels,
    selectedChannelId,
    loadingChannels,
    loadChannels,
    selectChannel,
    leaveChannel
  }
})
