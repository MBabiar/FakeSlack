import axios from 'axios'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { ref } from 'vue'

export const useIdentityStore = defineStore('identity', () => {
  const id = ref()
  const firstName = ref()
  const lastName = ref()
  const email = ref()
  const nickname = ref()
  const token = ref()

  const socket = ref()

  const login = async (data: { email: string; password: string }) => {
    const response = await axios.post('http://localhost:3333/auth/login', {
      email: data.email,
      password: data.password
    })

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
      token.value = response.data.token
      establishSocketConnection()
    }
  }

  const register = async (data: {
    firstName: string
    lastName: string
    email: string
    nickname: string
    password: string
    passwordConfirmation: string
  }) => {
    const response = await axios.post('http://localhost:3333/auth/register', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      nickname: data.nickname,
      password: data.password,
      passwordConfirmation: data.passwordConfirmation
    })

    id.value = response.data.id
    firstName.value = response.data.firstName
    lastName.value = response.data.lastName
    email.value = response.data.email
    nickname.value = response.data.nickname
  }

  const establishSocketConnection = () => {
    console.log('establishing socket connection')
    const sock = io('http://localhost:3333', { auth: { token: token.value } })
    socket.value = sock
  }

  const checkLoggedIn = async () => {
    const storedToken = localStorage.getItem('token')

    if (!storedToken) {
      return
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`

    const response = await axios.get('http://localhost:3333/auth/me')

    id.value = response.data.id
    firstName.value = response.data.firstName
    lastName.value = response.data.lastName
    email.value = response.data.email
    nickname.value = response.data.nickname
    token.value = storedToken

    establishSocketConnection()
  }

  return { id, firstName, lastName, email, nickname, register, login, token, checkLoggedIn, socket }
})
