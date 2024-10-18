import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChannelsStore = defineStore('channels', () => {
  const channels = ref([
    {
      id: 1,
      name: 'Chill Vibes',
      private: true,
      new: false
    },
    {
      id: 2,
      name: 'Fitness Hub',
      private: true,
      new: false
    },
    {
      id: 3,
      name: "Gamer's Paradise",
      private: false,
      new: false
    },
    {
      id: 4,
      name: 'Art & Crafts Collective',
      private: false,
      new: false
    },
    {
      id: 5,
      name: 'Tech Savvy',
      private: true,
      new: true
    },
    {
      id: 6,
      name: 'Health and Harmony',
      private: false,
      new: false
    },
    {
      id: 7,
      name: 'Music Junkies',
      private: false,
      new: false
    },
    {
      id: 8,
      name: 'The Coding Den',
      private: true,
      new: false
    },
    {
      id: 9,
      name: 'Creative Space',
      private: true,
      new: false
    },
    {
      id: 10,
      name: 'Foodies United',
      private: false,
      new: false
    }
  ])

  return { channels }
})
