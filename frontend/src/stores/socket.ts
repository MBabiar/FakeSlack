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

    socket.value.on('getTyping', (data: { userNickname: string; text: string }) => {
      // Clear existing timeout if member exists
      const existingIndex = messagesStore.typingMembers.findIndex(
        (typingMember) => typingMember.userNickname === data.userNickname
      )

      if (existingIndex !== -1) {
        clearTimeout(messagesStore.typingMembers[existingIndex].timeoutId)
        // Update existing member
        const updatedMembers = [...messagesStore.typingMembers]
        updatedMembers[existingIndex] = {
          ...data,
          timeoutId: setTimeout(() => {
            messagesStore.typingMembers = messagesStore.typingMembers.filter(
              (member) => member.userNickname !== data.userNickname
            )
          }, 10000)
        }
        messagesStore.typingMembers = updatedMembers
      } else {
        // Add new member
        messagesStore.typingMembers = [
          ...messagesStore.typingMembers,
          {
            ...data,
            timeoutId: setTimeout(() => {
              messagesStore.typingMembers = messagesStore.typingMembers.filter(
                (member) => member.userNickname !== data.userNickname
              )
            }, 10000)
          }
        ]
      }
    })
  }

  return {
    socket,
    establishSocketConnection
  }
})
