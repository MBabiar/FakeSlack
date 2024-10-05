<template>
  <q-card class="auth-card q-pa-lg">
    <q-card-section>
      <div class="text-h5 text-weight-bold text-center text-grey-3">Welcome Back!</div>
      <div class="text-caption text-center text-grey">We're excited to see you again!</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="onLogin" class="q-gutter-y-sm">
        <q-input
          v-model="loginForm.email"
          label="Email"
          type="email"
          dark
          bg-color="grey-10"
          outlined
          :rules="[(val) => !!val || 'Email is required']"
        />

        <q-input
          v-model="loginForm.password"
          label="Password"
          :type="isPwd ? 'password' : 'text'"
          dark
          bg-color="grey-10"
          outlined
          :rules="[(val) => !!val || 'Password is required']"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
        <q-btn rounded label="Login" type="submit" color="primary" class="full-width" size="lg" />
      </q-form>
      <div class="text-caption text-center text-grey q-mt-md">
        Don't have an account?
        <router-link to="/register" class="text-primary">Register</router-link>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const isPwd = ref(true)
    const loginForm = ref({
      email: '',
      password: ''
    })

    const onLogin = () => {
      // Implement login logic here
      console.log('Login:', loginForm.value)
    }

    return {
      isPwd,
      loginForm,
      onLogin
    }
  }
})
</script>

<style>
.q-field--outlined .q-field__control:before {
  border-color: #202225;
}
.q-field--outlined .q-field__control {
  border-radius: 12px;
}
</style>
