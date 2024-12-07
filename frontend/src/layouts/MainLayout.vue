<template>
  <q-layout view="lHh Lpr lFf">
    <q-banner v-if="!networkStore.isOnline" class="bg-warning text-white">
      You are currently offline. Some features may be unavailable.
    </q-banner>
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
                  <div class="row items-center">
                    {{ channel.name }}
                    <q-icon
                      v-if="channel.isAuthor"
                      name="star"
                      color="amber-8"
                      size="xs"
                      class="q-ml-xs"
                    />
                  </div>
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
          @click="createChannelBool = true"
        />
        <q-separator />
        <div style="display: flex; padding: 1em; align-items: center">
          <q-btn round color="primary" icon="person" style="margin-right: 1em">
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item
                  clickable
                  v-close-popup
                  :style="{
                    'background-color': identityStore.status === 'online' ? 'lightgreen' : ''
                  }"
                  @click="identityStore.switchStatus('online')"
                >
                  <q-item-section avatar>
                    <q-icon color="primary" name="task_alt" />
                  </q-item-section>
                  <q-item-section>Online</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="identityStore.switchStatus('dnd')"
                  :style="{ 'background-color': identityStore.status === 'dnd' ? 'orange' : '' }"
                >
                  <q-item-section avatar>
                    <q-icon color="primary" name="do_not_disturb" />
                  </q-item-section>
                  <q-item-section>Do not Disturb</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="identityStore.switchStatus('offline')"
                  :style="{ 'background-color': identityStore.status === 'offline' ? 'red' : '' }"
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
              {{ identityStore.firstName }} {{ identityStore.lastName }}
              <q-tooltip>{{ identityStore.nickname }}</q-tooltip>
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
          <q-btn
            flat
            label="Yes"
            color="primary"
            v-close-popup
            @click="leaveChannel(leaveChannelId)"
          />
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

    <q-dialog v-model="createChannelBool" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <q-input
            ref="channelNameInput"
            filled
            v-model="channelName"
            label="Channel name"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Please select a channel name']"
            style="width: 30em"
          />
          <q-toggle v-model="privateChannelBool" label="Private Channel" color="primary" />
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn label="Create" color="primary" @click="handleCreateChannel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- App Header -->
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

    <!-- Chat Window -->
    <router-view />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useChannelsStore } from 'src/stores/channels'
import { useRouter } from 'vue-router'
import { useIdentityStore } from 'src/stores/identity-store'
import { useNetworkStore } from 'src/stores/network-store'

// Router
const router = useRouter()

// Stores
const channelsStore = useChannelsStore()
const identityStore = useIdentityStore()

const networkStore = useNetworkStore()

// Variables
const channelName = ref('')
const channelNameInput = ref()
const closeChannelId = ref(0)
const confirmCloseChannel = ref(false)
const confirmLeaveChannel = ref(false)
const confirmLogout = ref(false)
const createChannelBool = ref(false)
const isLoading = ref(true)
const leaveChannelId = ref(0)
const leftDrawerOpen = ref(false)
const notificationsEnabled = ref(true)
const privateChannelBool = ref(false)

const selectChannel = (channel: number) => {
  try {
    channelsStore.selectChannel(channel)
  } catch (error) {
    console.error('Failed to select channel:', error)
  }
}

const handleCreateChannel = async () => {
  const isValid = await channelNameInput.value.validate()
  if (isValid) {
    channelsStore.createChannel(channelName.value, privateChannelBool.value)
    createChannelBool.value = false
  }
}

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const toggleNotifications = () => {
  notificationsEnabled.value = !notificationsEnabled.value
}

const leaveChannel = async (channel: number) => {
  channelsStore.leaveChannel(channel)
  leaveChannelId.value = 0
}

const closeChannel = () => {
  channelsStore.channels = channelsStore.channels.filter(
    (channel) => channel.id !== closeChannelId.value
  )
  closeChannelId.value = 0
}

const onLogout = async () => {
  await identityStore.logout()
  router.push({ path: '/auth/login' })
}
defineOptions({
  name: 'MainLayout'
})

onMounted(async () => {
  try {
    await channelsStore.loadChannels(true)
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
