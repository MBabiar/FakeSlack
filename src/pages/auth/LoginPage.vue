<template>
  <q-card-section>
    <h5 class="text-weight-bold text-center text-grey-4 q-ma-none">Welcome Back!</h5>
  </q-card-section>

  <q-card-section>
    <q-form @submit="onLogin" class="q-gutter-y-sm">
      <CustomInput
        v-model="loginForm.email"
        label="Email"
        :rules="[(val: any) => !!val || 'Email is required', (val: any) => validateEmail(val) || 'Invalid email']"
      />

      <CustomInput
        v-model="loginForm.password"
        label="Password"
        :type="passwordVisibility ? 'password' : 'text'"
        :rules="[(val: any) => !!val || 'Password is required', (val: any) => validatePassword(val) || 'Password must be at least 8 characters']"
      >
        <template v-slot:append>
          <q-icon
            :name="passwordVisibility ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="passwordVisibility = !passwordVisibility"
          />
        </template>
      </CustomInput>

      <q-btn rounded label="Login" type="submit" color="primary" class="full-width" size="lg" />
    </q-form>

    <div class="text-caption text-center text-grey q-mt-md">
      Don't have an account?
      <router-link to="/register" class="text-primary">Register</router-link>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomInput from 'src/components/Input.vue'
import { useRouter } from 'vue-router'
import validator from 'validator'

const router = useRouter()

defineOptions({
  name: 'LoginPage'
})
const passwordVisibility = ref(true)
const loginForm = ref({
  email: '',
  password: ''
})

function validateEmail(email: string) {
  return validator.isEmail(email)
}

function validatePassword(password: string) {
  return password.length >= 8
}

const onLogin = () => {
  router.push({ path: '/index' })
}
</script>
