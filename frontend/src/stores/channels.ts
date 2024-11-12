import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useIdentityStore } from './identity-store'

export const useChannelsStore = defineStore('channels', () => {
  const identityStore = useIdentityStore()
  const loading = ref(false)

  const channels = ref([
    {
      id: 1,
      name: 'LOADING',
      private: false,
      new: false
    }
  ])

  const loadChannels = () => {
    loading.value = true
    console.log('Fetching channels...')
    identityStore.socket.emit('getChannels')

    identityStore.socket.on('channels', (data: unknown) => {
      console.log('Got channels:', data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const channelsMapped = (data as any[]).map((channel) => {
        return {
          id: channel.id,
          name: channel.name,
          private: channel.private,
          new: false
        }
      })
      channels.value = channelsMapped
      loading.value = false
    })
  }

  return { channels, loadChannels, loading }
})
