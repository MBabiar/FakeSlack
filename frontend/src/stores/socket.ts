import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { ref } from 'vue'
import { useIdentityStore } from './identity-store'
import { useMessagesStore } from './messages'
import { useChannelsStore } from './channels'
import { Notify } from 'quasar'

export const useSocketStore = defineStore('socket', () => {
  const identityStore = useIdentityStore()
  const messagesStore = useMessagesStore()
  const channelStore = useChannelsStore()

  const socket = ref()

  const isMessageHighlighted = (text: string[]) => {
    const textArray = Array.isArray(text) ? text : [text]
    return textArray.some((text) => {
      return (
        text.includes(`@${identityStore.nickname}`) ||
        text.includes(`@${identityStore.firstName} ${identityStore.lastName}`)
      )
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const showNotification = async (message: any, channelName: string) => {
    // Check browser support
    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser')
      return
    }

    try {
      // Request permission if not granted
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return
      }

      // Create notification with full options
      const notification = new Notification(`Message in ${channelName}`, {
        body: `${message.author.nickname}: ${message.content}`,
        icon: '/icons/favicon-128x128.png',
        badge: '/icons/favicon-32x32.png',
        tag: `msg-${message.channelId}`,
        requireInteraction: true,
        silent: false,
        data: {
          channelId: message.channelId,
          messageId: message.id
        }
      })

      // Add click handler to focus window
      notification.onclick = () => {
        window.focus()
        channelStore.selectChannel(message.channelId)
        notification.close()
      }
    } catch (error) {
      console.error('Error showing notification:', error)
    }
  }

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
      if (!document.hasFocus() && identityStore.status === 'online') {
        if (messagesStore.notificationsOnlyMentions && isMessageHighlighted(newMessage.text)) {
          const channelName = channelStore.channels.find(
            (channel) => channel.id === newMessage.channelId
          )?.name
          if (channelName) {
            showNotification(newMessage, channelName)
          }
        } else {
          const channelName = channelStore.channels.find(
            (channel) => channel.id === newMessage.channelId
          )?.name
          if (channelName) {
            showNotification(newMessage, channelName)
          }
        }
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

    socket.value.on('channelRevoked', (channelId: number) => {
      const channelName = channelStore.channels.find((channel) => channel.id === channelId)?.name
      Notify.create({
        type: 'warning',
        message: 'You were removed from a channel: ' + channelName,
        position: 'top'
      })
      channelStore.channels = channelStore.channels.filter((channel) => channel.id !== channelId)
    })

    socket.value.on('userBanned', (data: { userNickname: string; channelId: number }) => {
      const channelName = channelStore.channels.find(
        (channel) => channel.id === data.channelId
      )?.name
      Notify.create({
        type: 'warning',
        message: `User ${data.userNickname} was banned from channel: ${channelName}`,
        position: 'top'
      })
    })

    socket.value.on('channelDeleted', (channelId: number) => {
      const channelName = channelStore.channels.find((channel) => channel.id === channelId)?.name
      Notify.create({
        type: 'warning',
        message: 'Channel was deleted: ' + channelName,
        position: 'top'
      })
      channelStore.channels = channelStore.channels.filter((channel) => channel.id !== channelId)
    })
  }

  return {
    socket,
    establishSocketConnection
  }
})
