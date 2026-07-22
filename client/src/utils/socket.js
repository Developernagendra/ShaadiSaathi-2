import { io } from 'socket.io-client'

let socket = null

export const initSocket = (user) => {
  let socketUrl = import.meta.env.VITE_SOCKET_URL;
  if (!socketUrl) {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'https://shaadisaathi-backend.onrender.com';
    if (rawApiUrl.startsWith('http')) {
      // Strip /api if it exists at the end
      socketUrl = rawApiUrl.replace(/\/api\/?$/, '');
    } else {
      socketUrl = 'https://shaadisaathi-backend.onrender.com';
    }
  }
  
  if (!socket) {
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      if (user?._id) emitJoinEvents(user)
    })

    socket.on('disconnect', () => { })
    socket.on('connect_error', (err) => { console.error('Socket error:', err.message) })
  } else if (socket.connected && user?._id) {
    // If already connected, just emit join events for the current user
    emitJoinEvents(user)
  }

  return socket
}

const emitJoinEvents = (user) => {
  if (!socket || !socket.connected) return

  socket.emit('join_user', user._id)
  
  if (user.role === 'admin') {
    socket.emit('join_role', 'admin')
  } else if (user.role === 'vendor') {
    socket.emit('join_role', 'vendor')
    if (user.vendorId) {
      socket.emit('join_vendor_business', user.vendorId)
    }
  }
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null }
}

export { socket }
