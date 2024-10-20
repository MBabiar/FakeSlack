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
              @click="messages.splice(-5)"
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
            <div>Samuel Csető<q-tooltip>samuelcseto</q-tooltip></div>
            <div style="color: grey">samuelcseto@gmail.com</div>
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
            v-for="(message, index) in messages"
            :key="index"
            :class="{ highlighted: isHighlighted(message) }"
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
        </q-infinite-scroll>
      </div>

      <div style="margin-top: 0">
        <q-input outlined v-model="text" label="Message or Command (/)" @keyup.enter="sendMessage">
          ><q-tooltip v-model="isCommand"
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
import { computed, ref, useTemplateRef } from 'vue'
import { useChannelsStore } from 'src/stores/channels'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'

const channelsStore = useChannelsStore()
const router = useRouter()

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
    messages.value.unshift({
      name: 'Mário Babiar',
      text: ['Loading more messages...']
    })
    done()
  }, 1000)
}

const messages = ref([
  {
    name: 'Mário Babiar',
    text: ['Hey, how are you?']
  },
  {
    name: 'Samuel Csető',
    text: ["I'm good, lol 😂"],
    me: true
  },
  {
    name: 'Elena Novak',
    text: ['Anyone up for a game tonight?']
  },
  {
    name: 'Lucas Kováč',
    text: ['Sure, count me in!']
  },
  {
    name: 'Mário Babiar',
    text: ['I can join too.']
  },
  {
    name: 'Samuel Csető',
    text: ['Nice! What time works for you?'],
    me: true
  },
  {
    name: 'Elena Novak',
    text: ['Maybe 8 PM?']
  },
  {
    name: 'Lucas Kováč',
    text: ['Sounds good to me!']
  },
  {
    name: 'Samuel Csető',
    text: ['Alright, 8 PM it is then!'],
    me: true
  },
  {
    name: 'Samuel Csető',
    text: ['See you all later 😊'],
    me: true
  },
  {
    name: 'Mário Babiar',
    text: ['Cool! Looking forward to it.']
  },
  {
    name: 'Anna Horváth',
    text: ['Hey guys, what game are you playing tonight?']
  },
  {
    name: 'Samuel Csető',
    text: ["We're thinking about trying Valorant."],
    me: true
  },
  {
    name: 'Samuel Csető',
    text: ['Wanna join?'],
    me: true
  },
  {
    name: 'Anna Horváth',
    text: ['Oh, I’m not very good at shooters, but I’ll watch!']
  },
  {
    name: 'Lucas Kováč',
    text: ['The more, the merrier!']
  },
  {
    name: 'Elena Novak',
    text: ['See you all at 8!']
  },
  {
    name: 'Mário Babiar',
    text: ['Sounds like a plan!']
  },
  {
    name: 'Samuel Csető',
    text: ["I'll set up the server."],
    me: true
  },
  {
    name: 'Samuel Csető',
    text: ["Let's crush it tonight 💪"],
    me: true
  },
  {
    name: 'Lucas Kováč',
    text: ['We got this!']
  },
  {
    name: 'Anna Horváth',
    text: ['Good luck everyone 😄']
  },
  {
    name: 'Mário Babiar',
    text: ['GG, see you in the game!']
  },
  {
    name: 'Samuel Csető',
    text: ["GG! Can't wait!"],
    me: true
  },
  {
    name: 'Elena Novak',
    text: ['Wait, do I need to download anything?']
  },
  {
    name: 'Lucas Kováč',
    text: ['Yeah, you need to install Valorant.']
  },
  {
    name: 'Mário Babiar',
    text: ['It’s free, so don’t worry.']
  },
  {
    name: 'Anna Horváth',
    text: ['I just realized my internet is slow today… 😓']
  },
  {
    name: 'Samuel Csető',
    text: ['That’s alright, you can still spectate!'],
    me: true
  },
  {
    name: 'Samuel Csető',
    text: ['No pressure!'],
    me: true
  },
  {
    name: 'Lucas Kováč',
    text: ["Yep, it's just for fun!"]
  },
  {
    name: 'Elena Novak',
    text: ['Downloading now. Should be ready by 8!']
  },
  {
    name: 'Mário Babiar',
    text: ['Great!']
  },
  {
    name: 'Samuel Csető',
    text: ['Let’s make this a weekly thing.'],
    me: true
  },
  {
    name: 'Samuel Csető',
    text: ['Gaming nights, every Friday!'],
    me: true
  },
  {
    name: 'Anna Horváth',
    text: ['That sounds like fun!']
  },
  {
    name: 'Elena Novak',
    text: ['I’m in!']
  },
  {
    name: 'Lucas Kováč',
    text: ['Let’s do it!']
  },
  {
    name: 'Mário Babiar',
    text: ['Count me in too!']
  },
  {
    name: 'Samuel Csető',
    text: ['Friday nights are officially gaming nights then 😎'],
    me: true
  },
  {
    name: 'Anna Horváth',
    text: ['Yay! 🎉']
  },
  {
    name: 'Elena Novak',
    text: ['🎮🎮🎮']
  },
  {
    name: 'Lucas Kováč',
    text: ['GG everyone!']
  },
  {
    name: 'Samuel Csető',
    text: ['GG! Talk to you later!'],
    me: true
  },
  {
    name: 'Mário Babiar',
    text: ['Take care everyone!']
  },
  {
    name: 'Elena Novak',
    text: ['Bye!']
  },
  {
    name: 'Anna Horváth',
    text: ['See you all soon!']
  },
  {
    name: 'Lucas Kováč',
    text: ['See you next Friday!']
  },
  {
    name: 'Samuel Csető',
    text: ['Next Friday, same time!'],
    me: true
  },
  {
    name: 'Samuel Csető',
    text: ['Bye everyone 👋'],
    me: true
  },
  {
    name: 'Elena Novak',
    text: ['Btw, I found a cool new recipe for cookies. Wanna try?']
  },
  {
    name: 'Mário Babiar',
    text: ['I’m always up for cookies!']
  },
  {
    name: 'Anna Horváth',
    text: ['Me too!']
  },
  {
    name: 'Samuel Csető',
    text: ['I could use some cookies now 🍪'],
    me: true
  },
  {
    name: 'Lucas Kováč',
    text: ['Drop the recipe!']
  },
  {
    name: 'Elena Novak',
    text: ['Alright, here’s the link to the recipe: www.cookies.com']
  },
  {
    name: 'Samuel Csető',
    text: ['I’ll try it this weekend!'],
    me: true
  },
  {
    name: 'Samuel Csető',
    text: ['Thanks Elena!'],
    me: true
  },
  {
    name: 'Anna Horváth',
    text: ['I might make them tonight.']
  },
  {
    name: 'Lucas Kováč',
    text: ['Cookies for gaming night?']
  },
  {
    name: 'Mário Babiar',
    text: ['Yes, please!']
  },
  {
    name: 'Samuel Csető',
    text: ['Let’s make it a tradition! Gaming + cookies = perfection.'],
    me: true
  },
  {
    name: 'Elena Novak',
    text: ['That’s the spirit! 😄']
  },
  {
    name: 'Anna Horváth',
    text: ['Alright, cookies for Friday night it is!']
  },
  {
    name: 'Lucas Kováč',
    text: ['This is gonna be awesome!']
  },
  {
    name: 'Mário Babiar',
    text: ['I love this group!']
  },
  {
    name: 'Samuel Csető',
    text: ['Same here!'],
    me: true
  },
  {
    name: 'Samuel Csető',
    text: ['You guys are the best 😊'],
    me: true
  },
  {
    name: 'Anna Horváth',
    text: ['Awww, we love you too!']
  },
  {
    name: 'Elena Novak',
    text: ['Group hug! 🤗']
  },
  {
    name: 'Lucas Kováč',
    text: ['Haha, let’s not get too emotional now 😆']
  },
  {
    name: 'Mário Babiar',
    text: ['Alright, alright, back to planning!']
  },
  {
    name: 'Samuel Csető',
    text: ["Next week's game suggestions?"],
    me: true
  },
  {
    name: 'Elena Novak',
    text: ['How about Rocket League?']
  },
  {
    name: 'Anna Horváth',
    text: ['I love that game!']
  },
  {
    name: 'Lucas Kováč',
    text: ['Rocket League it is!']
  },
  {
    name: 'Mário Babiar',
    text: ['Can’t wait!']
  },
  {
    name: 'Samuel Csető',
    text: ['Let’s do it! Next Friday: Rocket League + cookies!'],
    me: true
  },
  {
    name: 'Elena Novak',
    text: ['🎮🍪🎮']
  },
  {
    name: 'Anna Horváth',
    text: ['Perfect combo!']
  },
  {
    name: 'Lucas Kováč',
    text: ['GG everyone, see you then!']
  },
  {
    name: 'Mário Babiar',
    text: ['Take care, everyone!']
  },
  {
    name: 'Samuel Csető',
    text: ['Bye!'],
    me: true
  },
  {
    name: 'Mário Babiar',
    text: ['Yo! Samuel Csető, you there?']
  },
  {
    name: 'Mário Babiar',
    text: ['Yo! @Samuel Csető, you there?']
  },
  {
    name: 'Samuel Csető',
    text: ['Hey, what’s up?'],
    me: true
  }
])

const isHighlighted = (message: { text: string[] }) => {
  return message.text.some((text: string) => text.includes('@Samuel Csető'))
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
    messages.value.push({
      name: 'Samuel Csető',
      text: [text.value],
      me: true
    })

    // Show notification for new message
    showNotification('Samuel Csető', text.value)

    text.value = ''
    // scroll to bottom
    setTimeout(() => {
      chatContainer.value!.scrollTop = chatContainer.value!.scrollHeight
    }, 10)
  }
}

const shouldDisplayName = (index: number) => {
  if (index === 0) return true
  return messages.value[index].name !== messages.value[index - 1].name
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

const showNotification = (senderName: string, message: string) => {
  Notify.create({
    message: `${senderName} says: ${message}`,
    color: 'primary',
    multiLine: true,
    position: 'top',
    actions: [
      {
        label: 'Reply',
        color: 'yellow',
        handler: () => {
          /* ... */
        }
      },
      {
        label: 'Dismiss',
        color: 'white',
        handler: () => {
          /* ... */
        }
      }
    ]
  })
}
</script>

<style scoped>
.highlighted {
  background-color: rgba(221, 221, 30, 0.25); /* Light Blue */
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
