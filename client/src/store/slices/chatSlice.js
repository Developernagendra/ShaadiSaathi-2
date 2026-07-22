import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchMyChats = createAsyncThunk('chat/fetchMine', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/chat')
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch chats');
    return rejectWithValue(msg)
  }
})

export const fetchAllChatsAdmin = createAsyncThunk('chat/fetchAllAdmin', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/chat/admin/all')
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch all chats');
    return rejectWithValue(msg)
  }
})

export const fetchUnreadChatCount = createAsyncThunk('chat/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/chat/unread-count')
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch unread count');
    return rejectWithValue(msg)
  }
})

export const fetchChatMessages = createAsyncThunk('chat/fetchMessages', async (chatId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/chat/${chatId}/messages`)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch messages');
    return rejectWithValue(msg)
  }
})

export const startChat = createAsyncThunk('chat/start', async (vendorId, { rejectWithValue }) => {
  try {
    const res = await api.post('/chat/start', { vendorId })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to start chat');
    return rejectWithValue(msg)
  }
})

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ chatId, content }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/chat/${chatId}/messages`, { content })
    return { chatId, message: res.data.message }
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to send message');
    return rejectWithValue(msg)
  }
})

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    currentChat: null,
    messages: [],
    unreadCount: 0,
    loading: false,
    typingUsers: [],
  },
  reducers: {
    setCurrentChat: (state, action) => { state.currentChat = action.payload },
    receiveMessage: (state, action) => {
      if (state.currentChat?._id === action.payload.chatId) {
        state.messages.push(action.payload.message)
      }
    },
    setTyping: (state, action) => {
      if (!state.typingUsers.includes(action.payload)) state.typingUsers.push(action.payload)
    },
    clearTyping: (state, action) => {
      state.typingUsers = state.typingUsers.filter(u => u !== action.payload)
    },
    markMessagesRead: (state, action) => {
      const { chatId, readBy } = action.payload;
      if (state.currentChat?._id === chatId) {
        state.messages.forEach(msg => {
          if (msg.sender && msg.sender._id !== readBy && !msg.isRead) {
            msg.isRead = true;
          }
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyChats.fulfilled, (state, action) => { state.chats = action.payload.chats })
      .addCase(fetchAllChatsAdmin.fulfilled, (state, action) => { state.chats = action.payload.chats })
      .addCase(fetchChatMessages.pending, (state) => { state.loading = true })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false
        state.messages = action.payload.messages
        state.currentChat = action.payload.chat
      })
      .addCase(startChat.fulfilled, (state, action) => {
        state.currentChat = action.payload.chat
        const exists = state.chats.find(c => c._id === action.payload.chat._id)
        if (!exists) state.chats.unshift(action.payload.chat)
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message)
      })
      .addCase(fetchUnreadChatCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload.unreadCount
      })
  },
})

export const { setCurrentChat, receiveMessage, setTyping, clearTyping, markMessagesRead } = chatSlice.actions
export default chatSlice.reducer
