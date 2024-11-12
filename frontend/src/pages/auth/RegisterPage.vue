<template>
  <q-card-section>
    <h5 class="text-weight-bold text-center text-grey-4 q-ma-none">Create Account</h5>
  </q-card-section>

  <q-card-section>
    <q-form @submit="onRegister" class="q-gutter-y-sm">
      <CustomInput
        v-model="registerForm.firstName"
        label="First Name"
        :rules="[(val: any) => !!val || 'First Name is required']"
      />

      <CustomInput
        v-model="registerForm.lastName"
        label="Last Name"
        :rules="[(val: any) => !!val || 'Last Name is required']"
      />

      <CustomInput
        v-model="registerForm.email"
        label="Email"
        type="email"
        :rules="[(val: any) => !!val || 'Email is required', (val: any) => validateEmail(val) || 'Invalid email']"
      />

      <CustomInput
        v-model="registerForm.password"
        label="Password"
        :type="passwordVisibility ? 'password' : 'text'"
        :rules="[(val: any) => !!val || 'Password is required', (val: any) => validatePassword(val) || 'Password needs 8+ chars, 1 uppercase & 1 number']"
        >,
        <template v-slot:append>
          <q-icon
            :name="passwordVisibility ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="passwordVisibility = !passwordVisibility"
          /> </template
      ></CustomInput>

      <CustomInput
        v-model="registerForm.passwordConfirm"
        label="Confirm Password"
        :type="passwordVisibility ? 'password' : 'text'"
        :rules="[(val: any) => !!val || 'Password is required', (val: any) => validatePassword(val) || 'Password needs 8+ chars, 1 uppercase & 1 number', (val: any) => validatePasswordMatch(registerForm.password, val) || 'Passwords do not match']"
      >
        <template v-slot:append>
          <q-icon
            :name="passwordVisibility ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="passwordVisibility = !passwordVisibility"
          />
        </template>
      </CustomInput>

      <q-btn rounded label="Register" type="submit" color="primary" class="full-width" size="lg" />
    </q-form>

    <div class="text-caption text-center text-grey q-mt-md">
      Already have an account?
      <router-link to="/auth/login" class="text-primary">Login</router-link>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
import CustomInput from 'src/components/Input.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

defineOptions({
  name: 'RegisterPage'
})

const passwordVisibility = ref(true)
const registerForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirm: ''
})

function validateEmail(email: string) {
  return /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email)
}

function validatePassword(password: string) {
  const hasUpperCase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  return password.length >= 8 && hasUpperCase && hasNumber
}

function validatePasswordMatch(password: string, passwordConfirm: string) {
  return password === passwordConfirm
}

const onRegister = async () => {
  try {
    await axios.post('http://localhost:3333/auth/register', {
      fullName: `${registerForm.value.firstName} ${registerForm.value.lastName}`,
      email: registerForm.value.email,
      password: registerForm.value.password,
      passwordConfirmation: registerForm.value.passwordConfirm
    })

    // Registration successful
    router.push({ path: '/auth/login' })
  } catch (e) {
    console.error(e)
  }
}
</script>
