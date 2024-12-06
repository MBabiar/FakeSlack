<template>
  <q-page-container class="chat-container">
    <div class="scroll-y" style="padding: 0em 1em" ref="chatContainer">
      <!-- TODO: finish infinite scroll heigh (grid)-->
      <q-infinite-scroll
        @load="loadMoreMessages"
        reverse
        ref="infiniteScroll"
        style="height: calc(100vh - 150px)"
      >
        <template v-slot:loading>
          <div class="row justify-center q-my-md">
            <q-spinner color="primary" name="dots" size="40px" />
          </div>
        </template>

        <div
          v-if="
            selectedChannelId !== null &&
            messagesStore.messages &&
            messagesStore.messages.length > 0
          "
        >
          <div
            v-for="(message, index) in messagesStore.messages"
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
    <div>
      <q-input
        outlined
        v-model="text"
        label="Message or Command (/)"
        @keyup.enter="sendMessage"
        ref="chatInput"
      >
        <q-tooltip v-model="isCommand">
          <div v-if="!commandFormatSelected">
            Command Detected: Enter command to see arguments format
          </div>
          {{ commandFormatSelected }}
        </q-tooltip>
      </q-input>
      <div style="padding: 0.3em 1em">
        <q-badge v-if="showTypingIndicator">
          {{ firstTypingMember }} is typing...
          <q-tooltip>
            <template
              v-for="(member, index) in messagesStore.typingMembers"
              :key="member.userNickname"
            >
              {{ member.userNickname }}: {{ member.text.slice(0, 30)
              }}{{ member.text.length > 30 ? '...' : ''
              }}<br v-if="index < messagesStore.typingMembers.length - 1" />
            </template>
          </q-tooltip>
        </q-badge>
      </div>
    </div>
  </q-page-container>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { useChannelsStore } from 'src/stores/channels'
import { useIdentityStore } from 'src/stores/identity-store'
import { useMessagesStore } from 'src/stores/messages'
import { QInfiniteScroll } from 'quasar'
import { storeToRefs } from 'pinia'

// Stores
const channelsStore = useChannelsStore()
const identityStore = useIdentityStore()
const messagesStore = useMessagesStore()

// Variables
const { selectedChannelId } = storeToRefs(channelsStore)
const chatContainer = useTemplateRef('chatContainer')
const chatInput = useTemplateRef('chatInput')
const closeChannelId = ref(0)
const firstTypingMember = ref('')
const infiniteScroll = useTemplateRef<InstanceType<typeof QInfiniteScroll>>('infiniteScroll')
const leaveChannelId = ref(0)
const showTypingIndicator = ref(false)
const text = ref('')
const commandFormats = [
  { name: '/join', format: '/join <channel> <private>' },
  { name: '/cancel', format: '/cancel' },
  { name: '/quit', format: '/quit' },
  { name: '/create', format: '/create <channel> <private>' },
  { name: '/invite', format: '/invite <user>' },
  { name: '/close', format: '/close <channel>' },
  { name: '/list', format: '/list' },
  { name: '/help', format: '/help' },
  { name: '/revoke', format: '/revoke <userName>' },
  { name: '/kick', format: '/kick <userName>' }
]

const isCommand = computed(() => text.value.startsWith('/'))

const commandFormatSelected = computed(() => {
  return commandFormats.find((command) => text.value.startsWith(command.name))?.format
})

const shouldDisplayName = (index: number) => {
  if (index === 0) return true
  if (selectedChannelId.value === null) return false
  return messagesStore.messages[index].name !== messagesStore.messages[index - 1].name
}

const loadMoreMessages = async (index: number, done: (stop?: boolean) => void) => {
  setTimeout(async () => {
    if (selectedChannelId.value) {
      await messagesStore.fetchMessagesForChannel(selectedChannelId.value)
      if (messagesStore.pagination.page >= messagesStore.pagination.totalPages) {
        done(true) // Stop infinite scroll
      } else {
        done() // Continue allowing infinite scroll
      }
    }
    done()
  }, 50)
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

const closeChannel = () => {
  channelsStore.channels = channelsStore.channels.filter(
    (channel) => channel.id !== closeChannelId.value
  )
  closeChannelId.value = 0
}

const showHelp = () => {
  console.log('Showing help')
  // Add your help logic here
}

const handleCommand = () => {
  const [command, ...args] = text.value.split(' ')
  switch (command) {
    case '/join':
      const nameJoin = args[0]
      const privateBoolJoin = Number(args[1]) === 1 ? true : false
      channelsStore.joinChannel(nameJoin, privateBoolJoin)
      text.value = ''
      break
    case '/quit':
    case '/cancel':
      if (channelsStore.selectedChannelId) {
        channelsStore.leaveChannel(channelsStore.selectedChannelId)
        leaveChannelId.value = 0
        text.value = ''
      }
      break
    case '/create':
      const nameCreate = args[0]
      const privateBoolCreate = Number(args[1]) === 1 ? true : false
      channelsStore.createChannel(nameCreate, privateBoolCreate)
      text.value = ''
      break
    case '/invite':
      const userNickname = args[0]
      channelsStore.inviteUser(userNickname)
      text.value = ''
      break
    case '/close':
      closeChannel()
      text.value = ''
      break
    case '/list':
      channelsStore.listUsers()
      text.value = ''
      break
    case '/help':
      showHelp()
      text.value = ''
      break
    case '/revoke':
      const userToRevoke = args[0]
      channelsStore.revokeUser(userToRevoke)
      text.value = ''
      break
    case '/kick':
      const userToKick = args[0]
      channelsStore.kickUser(userToKick)
      text.value = ''
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
    text.value = ''
    // scroll to bottom
    setTimeout(() => {
      chatContainer.value!.scrollTop = chatContainer.value!.scrollHeight
    }, 10)
  }
}

watch(
  () => selectedChannelId.value,
  () => {
    if (selectedChannelId.value !== null) {
      infiniteScroll.value?.resume()
      chatContainer.value!.scrollTop = chatContainer.value!.scrollHeight
    }
  }
)

watch(
  () => text.value,
  (newValue) => {
    if (selectedChannelId.value !== null && newValue.length > 0 && isCommand.value === false) {
      messagesStore.sendTyping(selectedChannelId.value, newValue)
    }
  }
)

watch(
  () => messagesStore.typingMembers,
  (newTypingMembers) => {
    if (newTypingMembers?.length > 0) {
      firstTypingMember.value = newTypingMembers[0].userNickname
      showTypingIndicator.value = true
    } else {
      firstTypingMember.value = ''
      showTypingIndicator.value = false
    }
  },
  { immediate: true, deep: true }
)

defineOptions({
  name: 'ChatPage'
})
</script>

<style scoped>
.chat-container {
  display: grid;
  height: 100vh;
}

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
