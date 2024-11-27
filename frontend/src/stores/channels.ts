import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useMessagesStore } from './messages'
import { useSocketStore } from './socket'

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
    // await joinChannel(channelId)
    await messagesStore.fetchMessagesForChannel(channelId)
    selectedChannelId.value = channelId
  }

  // const joinChannel = (channelId: number) => {
  //   return new Promise<void>((resolve, reject) => {
  //     if (socketStore.socket) {
  //       socketStore.socket.emit('joinChannel', { channelId })
  //       resolve()
  //     } else {
  //       console.error('Socket is not connected')
  //       reject('Socket is not connected')
  //     }
  //   })
  // }

  const loadChannels = () => {
    return new Promise<void>(async (resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      socketStore.socket.on('error', (errorMessage: any) => {
        console.error('Error:', errorMessage)
        reject(errorMessage)
      })

      loadingChannels.value = true
      socketStore.socket.emit('getChannels')
      while (loadingChannels.value) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      resolve()
    })
  }

  return {
    channels,
    selectedChannelId,
    loadingChannels,
    loadChannels,
    selectChannel
  }
})
