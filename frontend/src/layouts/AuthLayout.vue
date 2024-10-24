<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="bg-dark flex flex-center">
        <q-card class="auth-card q-ma-sm-md q-py-sm q-px-lg">
          <q-card-section>
            <h3 class="text-center text-white q-ma-none">FakeSlack</h3>
          </q-card-section>
          <router-view />
        </q-card>
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
.auth-card {
  width: 100%;
  max-width: 450px;
  background: $grey-1;
  border-radius: 8px;
}

@media (max-width: $breakpoint-xs-max) {
  .auth-card {
    max-width: 100%;
    min-height: 100vh;
    height: 100%;
  }
}
</style>
