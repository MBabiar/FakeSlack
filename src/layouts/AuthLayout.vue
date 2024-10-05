<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="bg-dark flex flex-center">
        <div class="auth-container q-pa-md">
          <h2 class="text-center text-white q-my-lg">FakeSlack</h2>
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AuthLayout'
})
</script>

<style lang="scss">
.auth-container {
  align-self: flex-start;
  width: 100%;
  max-width: 450px;
}

.auth-card {
  background: #36393f;
  border-radius: 8px;
}
</style>
