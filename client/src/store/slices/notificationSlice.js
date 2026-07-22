import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications')
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch notifications');
    return rejectWithValue(msg)
  }
})

export const markAllRead = createAsyncThunk('notifications/markRead', async (_, { rejectWithValue }) => {
  try {
    await api.patch('/notifications/mark-read')
    return true
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to mark notifications read');
    return rejectWithValue(msg)
  }
})

export const markSingleRead = createAsyncThunk('notifications/markSingleRead', async (id, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/notifications/${id}/read`)
    return res.data.notification
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to mark notification read');
    return rejectWithValue(msg)
  }
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      // Check if already exists to avoid duplicates
      const exists = state.items.some(n => n._id === action.payload._id)
      if (!exists) {
        state.items.unshift(action.payload)
        state.unreadCount += 1
      }
    },
    incrementBadge: (state) => {
      state.unreadCount += 1
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0
        state.items = state.items.map(n => ({ ...n, isRead: true }))
      })
      .addCase(markSingleRead.fulfilled, (state, action) => {
        const updated = action.payload
        state.items = state.items.map(n => n._id === updated._id ? updated : n)
        state.unreadCount = state.items.filter(n => !n.isRead).length
      })
  },
})

export const { addNotification, incrementBadge } = notificationSlice.actions
export default notificationSlice.reducer
