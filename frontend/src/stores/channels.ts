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

  const channels = ref<Channel[]>([])
  const selectedChannelId = ref<number | null>(null)

  const selectChannel = (channelId: number) => {
    messagesStore.pagination.page = 0
    messagesStore.messages = []
    leaveChannelSocket(selectedChannelId.value)
    joinChannelSocket(channelId)
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

  const loadChannels = async () => {
    const response = await axios.get('http://localhost:3333/channels')
    if (response.status !== 200) {
      console.error('Error:', response.data)
      return
    }

    console.log('Channels:', response.data)

    channels.value = response.data
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

  const listUsers = async (channelId: number) => {
    const response = await axios.get(`http://localhost:3333/channel/users/${channelId}`)
    if (response.status !== 200) {
      console.error('Error:', response.data)
      return
    }

    const users = response.data.map((user: { nickname: string }) => user.nickname)

    Notify.create({
      type: 'List of users',
      message: users.join(', '),
      position: 'top'
    })
  }

  return {
    channels,
    selectedChannelId,
    loadChannels,
    selectChannel,
    leaveChannel,
    listUsers
  }
})
