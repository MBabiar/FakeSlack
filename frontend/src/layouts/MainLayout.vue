<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <div style="height: 100vh; display: flex; flex-direction: column">
        <q-scroll-area style="flex: 1">
          <q-list>
            <q-item
              v-for="channel in channelsStore.channels"
              :key="channel.id"
              clickable
              v-ripple
              @click="selectChannel(channel.id)"
            >
              <q-item-section avatar>
                <q-icon :name="channel.private ? 'lock' : 'public'" color="primary" />
              </q-item-section>

              <q-item-section>
                <q-item-label lines="1" style="display: flex; flex-direction: row">
                  <div>{{ channel.name }}</div>

                  <q-badge color="primary" v-if="channel.new" style="margin-left: auto">
                    NEW
                  </q-badge>
                </q-item-label>
              </q-item-section>

              <q-menu touch-position context-menu>
                <q-list dense style="min-width: 100px">
                  <q-item
                    clickable
                    @click="
                      (() => {
                        confirmLeaveChannel = true
                        leaveChannelId = channel.id
                      })()
                    "
                    v-close-popup
                  >
                    <q-item-section>Leave channel</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    @click="
                      (() => {
                        confirmCloseChannel = true
                        closeChannelId = channel.id
                      })()
                    "
                    v-close-popup
                  >
                    <q-item-section>Close channel</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-item>
          </q-list>
        </q-scroll-area>
        <q-btn
          color="primary"
          label="Create a channel"
          style="margin: 1em"
          @click="createChannel = true"
        />
        <q-separator />
        <div style="display: flex; padding: 1em; align-items: center">
          <q-btn round color="primary" label="SC" style="margin-right: 1em">
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item
                  clickable
                  v-close-popup
                  :style="{ 'background-color': state === 'online' ? 'lightgreen' : '' }"
                  @click="switchState('online')"
                >
                  <q-item-section avatar>
                    <q-icon color="primary" name="task_alt" />
                  </q-item-section>
                  <q-item-section>Online</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="switchState('dnd')"
                  :style="{ 'background-color': state === 'dnd' ? 'orange' : '' }"
                >
                  <q-item-section avatar>
                    <q-icon color="primary" name="do_not_disturb" />
                  </q-item-section>
                  <q-item-section>Do not Disturb</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="switchState('offline')"
                  :style="{ 'background-color': state === 'offline' ? 'red' : '' }"
                >
                  <q-item-section avatar>
                    <q-icon color="primary" name="hide_source" />
                  </q-item-section>
                  <q-item-section>Offline</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup>
                  <q-item-section @click="toggleNotifications">Notifications</q-item-section>
                  <q-item-section>
                    <q-toggle v-model="notificationsEnabled" color="primary" />
                  </q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-close-popup>
                  <q-item-section @click="confirmLogout = true">Log out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <div>
            <div>
              {{ identityStore.firstName }} {{ identityStore.lastName
              }}<q-tooltip>{{ identityStore.nickname }}</q-tooltip>
            </div>
            <div style="color: grey">{{ identityStore.email }}</div>
          </div>
        </div>
      </div>
    </q-drawer>

    <q-dialog v-model="confirmLeaveChannel" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Are you sure you want to leave channel?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="No" color="primary" v-close-popup />
          <q-btn flat label="Yes" color="primary" v-close-popup @click="leaveChannel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmCloseChannel" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Are you sure you want to close channel?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="No" color="primary" v-close-popup />
          <q-btn flat label="Yes" color="primary" v-close-popup @click="closeChannel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirmLogout" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm">Are you sure you want to log out?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="No" color="primary" v-close-popup />
          <q-btn flat label="Yes" @click="onLogout" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="createChannel" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-input
            filled
            v-model="channelName"
            label="Channel name"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please select a channel name']"
            style="width: 30em"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn label="Create" color="primary" v-close-popup @click="createChannelFunc" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container style="height: 100vh; display: flex; flex-direction: column">
      <q-header elevated>
        <q-toolbar>
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            class="lt-md"
            @click="toggleLeftDrawer"
          />
          <q-toolbar-title> FakeSlack </q-toolbar-title>
        </q-toolbar>
      </q-header>

      <div class="scroll-y" style="padding: 0em 1em" ref="chatContainer">
        <q-infinite-scroll @load="onLoad" reverse>
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
              :class="{ highlighted: message && isHighlighted(message) }"
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
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, onMounted } from 'vue'
import { useChannelsStore } from 'src/stores/channels'
import { useRouter } from 'vue-router'
import { useIdentityStore } from 'src/stores/identity-store'
import { useWebNotification } from '@vueuse/core'
import { useMessagesStore } from 'src/stores/messages'

const router = useRouter()
const channelsStore = useChannelsStore()
const identityStore = useIdentityStore()
const messagesStore = useMessagesStore()
const isLoading = ref(true)

const selectedChannelId = ref<number | null>(null)
const selectChannel = async (channelId: number) => {
  selectedChannelId.value = channelId
  await messagesStore.fetchMessagesForChannel(channelId)
  console.log('Selected channel:', channelId)
  console.log('Messages:', messagesStore.messages[channelId])
}

defineOptions({
  name: 'MainLayout'
})

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const confirmLogout = ref(false)
const confirmLeaveChannel = ref(false)
const confirmCloseChannel = ref(false)
const createChannel = ref(false)

const leaveChannelId = ref(0)
const closeChannelId = ref(0)

const channelName = ref('')
const chatContainer = useTemplateRef('chatContainer')
const state = ref('online')

const notificationsEnabled = ref(true)

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value
}

const switchState = function (newState: string) {
  state.value = newState
}

const onLoad = (index: number, done: () => void) => {
  setTimeout(() => {
    console.log('Loading more messages')
    done()
  }, 1000)
}

const isHighlighted = (message: { text: string[] }) => {
  return message.text.some((text: string) => text.includes(`@${identityStore.nickname}`))
}

const text = ref('')
const isCommand = computed(() => {
  return text.value.startsWith('/')
})
const commandFormats = [
  { name: '/join', format: '/join <channel>' },
  { name: '/leave', format: '/leave <channel>' },
  { name: '/create', format: '/create <channel>' },
  { name: '/close', format: '/close <channel>' },
  { name: '/list', format: '/list' },
  { name: '/help', format: '/help' }
]
const commandFormatSelected = computed(() => {
  return commandFormats.find((command) => text.value.startsWith(command.name))?.format
})

const sendMessage = function () {
  if (text.value) {
    // messagesStore.messages.value.push({
    //   name: 'Samuel Csető',
    //   text: [text.value],
    //   me: true
    // })

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
    messagesStore.messages[selectedChannelId.value][index].userId !==
    messagesStore.messages[selectedChannelId.value][index - 1].userId
  )
}

const onLogout = () => {
  router.push({ path: '/login' })
}

const createChannelFunc = () => {
  channelsStore.channels.push({
    id: channelsStore.channels.length + 1,
    name: channelName.value,
    new: true,
    private: false
  })
  channelName.value = ''
}

const leaveChannel = () => {
  channelsStore.channels = channelsStore.channels.filter(
    (channel) => channel.id !== leaveChannelId.value
  )
  leaveChannelId.value = 0
}

const closeChannel = () => {
  channelsStore.channels = channelsStore.channels.filter(
    (channel) => channel.id !== closeChannelId.value
  )
  closeChannelId.value = 0
}

onMounted(async () => {
  try {
    await channelsStore.loadChannels()
    if (channelsStore.channels.length > 0) {
      selectChannel(channelsStore.channels[0].id)
    }
  } catch (error) {
    console.error('Failed to load channels:', error)
  } finally {
    isLoading.value = false
  }
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
