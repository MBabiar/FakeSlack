import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Notify } from 'quasar'
import { useSocketStore } from './socket'

export const useIdentityStore = defineStore('identity', () => {
  const socketStore = useSocketStore()

  const email = ref()
  const firstName = ref()
  const id = ref()
  const lastName = ref()
  const nickname = ref()
  const token = ref()

  const login = async (data: { email: string; password: string }) => {
    const response = await axios.post('http://localhost:3333/auth/login', {
      email: data.email,
      password: data.password
    })

    if (response.data.token) {
      localStorage.setItem('token', response.data.token.token)
      token.value = response.data.token.token
      id.value = response.data.user.id
      firstName.value = response.data.user.firstName
      lastName.value = response.data.user.lastName
      email.value = response.data.user.email
      nickname.value = response.data.user.nickname
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      if (!socketStore.socket) {
        socketStore.establishSocketConnection()
      }

      console.log('Logged in')
      console.log(response.data)

      Notify.create({
        type: 'positive',
        message: 'Successfully logged in',
        position: 'top'
      })
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

    Notify.create({
      type: 'positive',
      message: 'Successfully registered',
      position: 'top'
    })
  }

  const checkLoggedIn = async () => {
    const storedToken = localStorage.getItem('token')

    if (!storedToken) {
      return
    }

    token.value = storedToken

    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

    const response = await axios.get('http://localhost:3333/auth/me')

    id.value = response.data.id
    firstName.value = response.data.firstName
    lastName.value = response.data.lastName
    email.value = response.data.email
    nickname.value = response.data.nickname

    if (!socketStore.socket) {
      socketStore.establishSocketConnection()
    }
  }

  const logout = async () => {
    id.value = null
    firstName.value = null
    lastName.value = null
    email.value = null
    nickname.value = null
    token.value = null
    socketStore.socket.disconnect()
    localStorage.removeItem('token')
  }

  const leaveChannel = (id: number) => {
    socketStore.socket.emit('leaveChannel', { channelId: id })
  }

  return {
    checkLoggedIn,
    email,
    firstName,
    id,
    lastName,
    leaveChannel,
    login,
    logout,
    nickname,
    register,
    token
  }
})
