import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { ref } from 'vue'
import { useIdentityStore } from './identity-store'
import { useMessagesStore } from './messages'
import { useChannelsStore } from './channels'
import { useWebNotification } from '@vueuse/core'
import { AppVisibility, Notify } from 'quasar'

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

      if (newMessage.channelId === channelStore.selectedChannelId) {
        messagesStore.messages.push(message)
      }

      if (newMessage.author.id === identityStore.id) {
        return
      }

      const { isSupported, show } = useWebNotification({
        title: 'New message from ' + newMessage.author.nickname,
        dir: 'auto',
        lang: 'en',
        renotify: true,
        tag: 'test',
        body: newMessage.content
      })

      if (isSupported.value && identityStore.status === 'online' && AppVisibility.appVisible) {
        console.log('Notification shown - app is in background')
        show()
      } else {
        const channelName = channelStore.channels.find(
          (channel) => channel.id === newMessage.channelId
        )?.name
        Notify.create({
          type: 'positive',
          message: `New message from: ${newMessage.author.nickname}<br>Channel: ${channelName}<br>Message: ${newMessage.content}`,
          position: 'top',
          html: true
        })
      }
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

    socket.value.on(
      'channelInvited',
      (data: { id: number; name: string; isAuthor: boolean; private: boolean }) => {
        const newChannel = {
          id: data.id,
          name: data.name,
          isAuthor: data.isAuthor,
          private: data.private,
          new: true
        }
        channelStore.channels.unshift(newChannel)
      }
    )
  }

  return {
    socket,
    establishSocketConnection
  }
})
