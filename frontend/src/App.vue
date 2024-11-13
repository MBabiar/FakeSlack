<template>
  <router-view />
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { useIdentityStore } from './stores/identity-store'
const identityStore = useIdentityStore()
defineOptions({
  name: 'App'
})

onBeforeMount(async () => {
  await identityStore.checkLoggedIn()
})
</script>
