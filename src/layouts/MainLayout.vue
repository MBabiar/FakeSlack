<template>
  <q-layout view="lHh Lpr lFf">
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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area style="height: calc(100% - 100px)">
        <q-list>
          <q-item v-for="conversation in conversations" :key="conversation.id" clickable v-ripple>
            <q-item-section avatar>
              <q-avatar>
                <img :src="conversation.avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1">
                {{ conversation.name }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
      <div>Tu bude Tvoj Profil</div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const conversations = [
  {
    id: 1,
    name: 'First Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 2,
    name: 'Second Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 3,
    name: 'Third Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 4,
    name: 'Fourth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 5,
    name: 'Fifth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 6,
    name: 'Sixth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 7,
    name: 'Seventh Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 8,
    name: 'Eighth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 9,
    name: 'Ninth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 10,
    name: 'Tenth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 11,
    name: 'Eleventh Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 12,
    name: 'Twelfth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 13,
    name: 'Thirteenth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 14,
    name: 'Fourteenth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  },
  {
    id: 15,
    name: 'Fifteenth Channel',
    avatar: 'https://cdn.quasar.dev/team/razvan_stoenescu.jpeg'
  }
]

defineOptions({
  name: 'MainLayout'
})

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
