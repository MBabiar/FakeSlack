<template>
  <!-- Register Form -->
  <q-card class="auth-card q-pa-lg">
    <q-card-section>
      <div class="text-h5 text-weight-bold text-center text-grey-3">Create Account</div>
      <div class="text-caption text-center text-grey">Join our community!</div>
    </q-card-section>

    <q-card-section>
      <q-form @submit="onRegister" class="q-gutter-y-sm">
        <q-input
          v-model="registerForm.username"
          label="Username"
          dark
          outlined
          bg-color="grey-10"
          :rules="[(val) => !!val || 'Username is required']"
        />

        <q-input
          v-model="registerForm.email"
          label="Email"
          type="email"
          dark
          outlined
          bg-color="grey-10"
          :rules="[(val) => !!val || 'Email is required']"
        />

        <q-input
          v-model="registerForm.password"
          label="Password"
          :type="isPwd ? 'password' : 'text'"
          dark
          outlined
          bg-color="grey-10"
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

        <q-btn
          rounded
          label="Register"
          type="submit"
          color="primary"
          class="full-width"
          size="lg"
        />
      </q-form>

      <div class="text-caption text-center text-grey q-mt-md">
        Already have an account?
        <router-link to="/login" class="text-primary">Login</router-link>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const isPwd = ref(true)
    const registerForm = ref({
      username: '',
      email: '',
      password: ''
    })

    const onRegister = () => {
      // Implement register logic here
      console.log('Register:', registerForm.value)
    }

    return {
      isPwd,
      registerForm,
      onRegister
    }
  }
})
</script>

<!--! Styles are in LoginPage.vue -->
