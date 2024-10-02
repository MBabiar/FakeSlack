import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref([
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
  ])

  return { channels }
})
