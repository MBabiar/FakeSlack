<template>
  <q-page-container style="height: 100vh; display: flex; flex-direction: column">
    <div class="scroll-y" style="padding: 0em 1em" ref="chatContainer">
      <q-infinite-scroll @load="loadMoreMessages" reverse>
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner color="primary" name="dots" size="40px" />
          </div>
        </template>

        <div
          v-if="
            selectedChannelId !== null &&
            messagesStore.messages[selectedChannelId] &&
            messagesStore.messages[selectedChannelId].length > 0
          "
        >
          <div
            v-for="(message, index) in messagesStore.messages[selectedChannelId]"
            :key="index"
            :class="{ highlighted: message && isMessageHighlighted(message) }"
            class="q-px-sm"
          >
            <q-chat-message
              v-if="shouldDisplayName(index)"
              :name="message.name"
              :text="message.text"
              :sent="message.me"
              class="first-message"
            />
            <q-chat-message
              v-else
              :name="''"
              :text="message.text"
              :sent="message.me"
              class="next-message"
            />
          </div>
        </div>
      </q-infinite-scroll>
    </div>
    <div style="margin-top: 0">
      <q-input outlined v-model="text" label="Message or Command (/)" @keyup.enter="sendMessage">
        <q-tooltip v-model="isCommand"
          ><div v-if="!commandFormatSelected">
            Command Detected: Enter command to see arguments format
          </div>
          {{ commandFormatSelected }}</q-tooltip
        ></q-input
      >
      <div style="padding: 0.3em 1em">
        <q-badge
          >Ed and Joanne is typing...
          <q-tooltip>Ed: Aho<br />Joanne: sranda to bo</q-tooltip></q-badge
        >
      </div>
    </div>
  </q-page-container>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useChannelsStore } from 'src/stores/channels'
import { useIdentityStore } from 'src/stores/identity-store'
import { useWebNotification } from '@vueuse/core'
import { useMessagesStore } from 'src/stores/messages'
import axios from 'axios'
import { storeToRefs } from 'pinia'

// Stores
const channelsStore = useChannelsStore()
const identityStore = useIdentityStore()
const messagesStore = useMessagesStore()

// Variables
const channelName = ref('')
const chatContainer = useTemplateRef('chatContainer')
const closeChannelId = ref(0)
const leaveChannelId = ref(0)
const notificationsEnabled = ref(true)
const { selectedChannelId } = storeToRefs(channelsStore)
const text = ref('')

const selectChannel = async (channelId: number) => {
  selectedChannelId.value = channelId
  await messagesStore.fetchMessagesForChannel(channelId)
}

const loadMoreMessages = (index: number, done: () => void) => {
  setTimeout(() => {
    console.log('Loading more messages')
    done()
  }, 1000)
}

const isMessageHighlighted = (message: { text: string[] }) => {
  const textArray = Array.isArray(message.text) ? message.text : [message.text]
  return textArray.some((text) => {
    return (
      text.includes(`@${identityStore.nickname}`) ||
      text.includes(`@${identityStore.firstName} ${identityStore.lastName}`)
    )
  })
}

const isCommand = computed(() => {
  return text.value.startsWith('/')
})

const commandFormats = [
  { name: '/join', format: '/join <channel>' },
  { name: '/leave', format: '/leave <channel>' },
  { name: '/create', format: '/create <channel>' },
  { name: '/invite', format: '/invite <user>' },
  { name: '/close', format: '/close <channel>' },
  { name: '/list', format: '/list' },
  { name: '/help', format: '/help' }
]

const commandFormatSelected = computed(() => {
  return commandFormats.find((command) => text.value.startsWith(command.name))?.format
})

const joinChannel = async (name: string, privateBool: boolean) => {
  console.log(`Joining channel: ${name}`)

  try {
    const response = await axios.post('http://localhost:3333/channel/join', {
      channelName: name,
      privateBool: privateBool
    })

    if (response.status === 200) {
      console.log('Joined channel:', name)
    }
  } catch (error) {
    console.error('Error joining channel:', error)
  }
  channelsStore.loadChannels()
}

const leaveChannel = async (channel: number) => {
  identityStore.leaveChannel(channel)
  leaveChannelId.value = 0
  await channelsStore.loadChannels()
  selectChannel(channelsStore.channels[0].id)
}

const createChannel = async () => {
  try {
    const response = await axios.post('http://localhost:3333/channels', {
      name: channelName.value
    })

    if (response.status === 201) {
      channelsStore.channels.push({
        id: response.data.id,
        name: channelName.value,
        new: true,
        private: false
      })
      channelName.value = ''
    }
  } catch (error) {
    console.error('Error creating channel:', error)
  }
}

const inviteUser = async (userNickname: string) => {
  console.log('Inviting user')
  try {
    const response = await axios.post('http://localhost:3333/channel/invite', {
      channelId: selectedChannelId.value,
      userNickname: userNickname
    })

    if (response.status === 200) {
      console.log('User invited')
    }
  } catch (error) {
    console.error('Error inviting user:', error)
  }
}

const closeChannel = () => {
  channelsStore.channels = channelsStore.channels.filter(
    (channel) => channel.id !== closeChannelId.value
  )
  closeChannelId.value = 0
}

const listChannels = () => {
  console.log('Listing channels')
  // Add your list channels logic here
}

const showHelp = () => {
  console.log('Showing help')
  // Add your help logic here
}

const handleCommand = () => {
  const [command, ...args] = text.value.split(' ')
  switch (command) {
    case '/join':
      const name = args[0]
      const privateBool = Number(args[1]) === 1 ? true : false
      joinChannel(name, privateBool)

      break
    case '/leave':
      const leaveChan = channelsStore.channels.find((channel) => channel.name === args[0])
      if (leaveChan) {
        leaveChannelId.value = leaveChan.id
      } else {
        console.log(`Channel ${args[0]} not found`)
      }
      leaveChannel(leaveChannelId.value)
      break
    case '/create':
      createChannel()
      break
    case '/invite':
      const userNickname = args[0]
      inviteUser(userNickname)
      break
    case '/close':
      closeChannel()
      break
    case '/list':
      listChannels()
      break
    case '/help':
      showHelp()
      break
    default:
      console.log('Unknown command')
  }
}

const sendMessage = function () {
  if (isCommand.value) {
    handleCommand()
    return
  }

  if (text.value) {
    if (selectedChannelId.value === null) {
      console.error('No channel selected')
      return
    }

    messagesStore.sendMessage(selectedChannelId.value, text.value)

    const { isSupported, show } = useWebNotification({
      title: 'New message from Samuel Csető',
      dir: 'auto',
      lang: 'en',
      renotify: true,
      tag: 'test',
      body: text.value
    })

    if (isSupported.value && notificationsEnabled.value) {
      console.log('Notification shown')
      show()
    }

    text.value = ''
    // scroll to bottom
    setTimeout(() => {
      chatContainer.value!.scrollTop = chatContainer.value!.scrollHeight
    }, 10)
  }
}

const shouldDisplayName = (index: number) => {
  if (index === 0) return true
  if (selectedChannelId.value === null) return false
  return (
    messagesStore.messages[selectedChannelId.value][index].name !==
    messagesStore.messages[selectedChannelId.value][index - 1].name
  )
}

defineOptions({
  name: 'ChatPage'
})
</script>

<style scoped>
.highlighted {
  background-color: rgba(221, 221, 30, 0.25);
  padding-top: 5px;
  padding-bottom: 5px;
}

.first-message {
  margin: 4px 0 4px 0;
}

.next-message {
  margin: 2px 0 2px 0;
}
</style>
