import io from 'socket.io-client'

let socket: ReturnType<typeof io> | null = null

export const connectSocket = () => {
  const token = localStorage.getItem('token')
  if (token && !socket) {
    socket = io('http://localhost:3333', { auth: { token } })
    console.log('WebSocket connected')
  }
  return socket
}

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket is not connected')
  }
  return socket
}
