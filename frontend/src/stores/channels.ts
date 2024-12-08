import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMessagesStore } from './messages'
import { useSocketStore } from './socket'
import axios from 'axios'
import { Notify } from 'quasar'

interface Channel {
  id: number
  name: string
  isAuthor: boolean
  private: boolean
  new: boolean
}

export const useChannelsStore = defineStore('channels', () => {
  const messagesStore = useMessagesStore()
  const socketStore = useSocketStore()

  const channels = ref<Channel[]>([])
  const selectedChannelId = ref<number | null>(null)

  const selectChannel = (channelId: number) => {
    if (selectedChannelId.value === channelId) {
      return
    }

    messagesStore.pagination.page = 0
    messagesStore.messages = []
    leaveChannelSocket(selectedChannelId.value)
    joinChannelSocket(channelId)
    selectedChannelId.value = channelId
  }

  const joinChannelSocket = (channelId: number) => {
    if (socketStore.socket) {
      socketStore.socket.emit('joinChannelSocket', { channelId })
    } else {
      console.error('Socket is not connected')
    }
  }

  const leaveChannelSocket = (channelId: number | null) => {
    if (socketStore.socket && channelId !== null) {
      socketStore.socket.emit('leaveChannelSocket', { channelId })
    }
  }

  const loadChannels = async (reset: boolean) => {
    const response = await axios.get('http://localhost:3333/channels')
    if (response.status !== 200) {
      console.error('Error:', response.data)
      return
    }
    channels.value = response.data
    if (reset) {
      selectedChannelId.value = channels.value[0].id
    }
  }

  const createChannel = async (name: string, privateBool: boolean) => {
    try {
      const response = await axios.post('http://localhost:3333/channels', {
        channelName: name,
        privateBool: privateBool
      })

      if (response.status === 201) {
        channels.value.unshift({
          id: response.data.id,
          name: name,
          isAuthor: true,
          new: true,
          private: privateBool
        })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error creating channel:', error)
      Notify.create({
        color: 'negative',
        message: error.response.data.message,
        position: 'top'
      })
    }
  }

  const joinChannel = async (name: string, privateBool: boolean) => {
    try {
      const response = await axios.post('http://localhost:3333/channel/join', {
        channelName: name,
        privateBool: privateBool
      })

      if (response.status === 200) {
        console.log('Joined channel:', name)
        channels.value.unshift({
          id: response.data.id,
          name: name,
          isAuthor: false,
          new: true,
          private: privateBool
        })
        Notify.create({
          type: 'positive',
          message: `Joined channel: ${name}`,
          position: 'top'
        })
      }

      if (response.status === 201) {
        channels.value.unshift({
          id: response.data.id,
          name: name,
          isAuthor: true,
          new: true,
          private: privateBool
        })
        Notify.create({
          type: 'positive',
          message: `Created and joined channel: ${name}`,
          position: 'top'
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error joining channel:', error)
      Notify.create({
        color: 'negative',
        message: error.response.data.message,
        position: 'top'
      })
    }
  }

  const leaveChannel = async (channelId: number): Promise<void> => {
    if (!socketStore.socket) {
      console.error('Socket is not connected')
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      const errorHandler = (error: string) => {
        console.error('Error leaving channel:', error)
        Notify.create({
          type: 'negative',
          message: error,
          position: 'top'
        })
        reject(error)
      }

      // Bind error handler
      socketStore.socket.once('error', errorHandler)

      // Listen for success response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socketStore.socket.once('leaveChannelSuccess', (data: any) => {
        socketStore.socket.off('error', errorHandler) // Remove error listener

        Notify.create({
          type: 'positive',
          message: `You left channel ${data.channelName}`,
          position: 'top'
        })

        channels.value = channels.value.filter((channel) => channel.id !== channelId)

        resolve()
      })

      // Emit leave request
      socketStore.socket.emit('leaveChannel', { channelId })
    })
  }

  const listUsers = async () => {
    const channelId = selectedChannelId.value

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

  const inviteUser = async (userNickname: string): Promise<void> => {
    if (!socketStore.socket) {
      console.error('Socket is not connected')
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      const errorHandler = (error: string) => {
        console.error('Error inviting user:', error)
        Notify.create({
          type: 'negative',
          message: error,
          position: 'top'
        })
        reject(error)
      }

      // Bind error handler
      socketStore.socket.once('error', errorHandler)

      // Listen for success response
      socketStore.socket.once('inviteUserSuccess', () => {
        socketStore.socket.off('error', errorHandler) // Remove error listener

        Notify.create({
          type: 'positive',
          message: `${userNickname} invited successfully`,
          position: 'top'
        })
        resolve()
      })

      // Emit invite request
      const channelId = selectedChannelId.value
      socketStore.socket.emit('inviteUser', { channelId, userNickname })
    })
  }

  const revokeUser = async (userNickname: string): Promise<void> => {
    if (!socketStore.socket) {
      console.error('Socket is not connected')
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      const errorHandler = (error: string) => {
        console.error('Error revoking user:', error)
        Notify.create({
          type: 'negative',
          message: error,
          position: 'top'
        })
        reject(error)
      }

      // Bind error handler
      socketStore.socket.once('error', errorHandler)

      // Listen for success response
      socketStore.socket.once('revokeUserSuccess', () => {
        socketStore.socket.off('error', errorHandler) // Remove error listener

        Notify.create({
          type: 'positive',
          message: `${userNickname} revoked successfully`,
          position: 'top'
        })
        resolve()
      })

      // Emit revoke request
      const channelId = selectedChannelId.value
      socketStore.socket.emit('revokeUser', { channelId, userNickname })
    })
  }

  const kickUser = async (userNickname: string): Promise<void> => {
    if (!socketStore.socket) {
      console.error('Socket is not connected')
      throw new Error('Socket not connected')
    }

    return new Promise((resolve, reject) => {
      const errorHandler = (error: string) => {
        console.error('Error kicking user:', error)
        Notify.create({
          type: 'negative',
          message: error,
          position: 'top'
        })
        reject(error)
      }

      // Bind error handler
      socketStore.socket.once('error', errorHandler)

      // Listen for success response
      socketStore.socket.once('kickUserSuccess', () => {
        socketStore.socket.off('error', errorHandler) // Remove error listener

        Notify.create({
          type: 'positive',
          message: `${userNickname} got vote for kick successfully`,
          position: 'top'
        })
        resolve()
      })

      // Emit kick request
      const channelId = selectedChannelId.value
      socketStore.socket.emit('kickUser', { channelId, userNickname })
    })
  }

  return {
    channels,
    inviteUser,
    joinChannel,
    leaveChannel,
    listUsers,
    loadChannels,
    selectChannel,
    selectedChannelId,
    createChannel,
    revokeUser,
    kickUser
  }
})
