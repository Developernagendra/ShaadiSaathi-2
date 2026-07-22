import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import toast from 'react-hot-toast'

// Async thunks
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data)
    const token = res.data.token || res.data.data?.token
    const user = res.data.user || res.data.data?.user
    const message = res.data.message || res.data.data?.message
    if (token) {
      localStorage.setItem('token', token)
    }
    return { ...res.data, token, user, message }
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || (typeof err === 'string' ? err : 'Registration failed');
    return rejectWithValue(msg)
  }
})

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data)
    const token = res.data.token || res.data.data?.token
    const user = res.data.user || res.data.data?.user
    const message = res.data.message || res.data.data?.message
    if (token) {
      localStorage.setItem('token', token)
    }
    return { ...res.data, token, user, message }
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || (typeof err === 'string' ? err : 'Login failed');
    return rejectWithValue(msg)
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
    return true
  } catch (err) {
    localStorage.removeItem('token') // Still remove token on error
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Logout failed');
    return rejectWithValue(msg)
  }
})

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    const user = res.data.user || res.data.data?.user
    return { ...res.data, user }
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch user');
    const status = err?.response?.status;
    return rejectWithValue({ msg, status })
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/users/profile', data)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Update failed');
    return rejectWithValue(msg)
  }
})

export const uploadAvatar = createAsyncThunk('auth/uploadAvatar', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Upload failed');
    return rejectWithValue(msg)
  }
})

export const changePassword = createAsyncThunk('auth/changePassword', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/change-password', data)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to change password');
    return rejectWithValue(msg)
  }
})

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/forgot-password', data)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed');
    return rejectWithValue(msg)
  }
})

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/auth/reset-password/${token}`, { password })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Reset failed');
    return rejectWithValue(msg)
  }
})

export const toggleWishlist = createAsyncThunk('auth/toggleWishlist', async (vendorId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/users/wishlist/${vendorId}`)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed');
    return rejectWithValue(msg)
  }
})

export const resendVerification = createAsyncThunk('auth/resendVerification', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/resend-verification', data)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to resend verification');
    return rejectWithValue(msg)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
    isInitialized: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('token')
    },
    clearError: (state) => { state.error = null },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setInitialized: (state) => {
      state.isInitialized = true
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.isInitialized = true
        toast.success(action.payload.message || 'Registration successful! Welcome to ShaadiSaathi!', { id: 'auth-success' })
      })
      .addCase(registerUser.rejected, (state, action) => {
        rejected(state, action)
        toast.error(action.payload, { id: 'auth-error' })
      })

      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.isInitialized = true
        toast.success(`Welcome back, ${action.payload.user.name}!`, { id: 'auth-success' })
      })
      .addCase(loginUser.rejected, (state, action) => {
        rejected(state, action)
        toast.error(action.payload, { id: 'auth-error' })
      })

      .addCase(getMe.pending, (state) => { state.loading = true })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.isInitialized = true
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false
        const status = action.payload?.status;
        // Only clear credentials and log out if explicitly unauthorized (401/403)
        if (status === 401 || status === 403 || !state.token) {
          state.isAuthenticated = false
          state.isInitialized = true
          state.token = null
          localStorage.removeItem('token')
        } else {
          // Keep token & auth status on network failures or temporary 5xx errors
          state.isInitialized = true
        }
      })

      .addCase(updateProfile.pending, pending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = { ...state.user, ...action.payload.user }
        toast.success('Profile updated!')
      })
      .addCase(updateProfile.rejected, (state, action) => {
        rejected(state, action)
        toast.error(action.payload)
      })

      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user = { ...state.user, avatar: action.payload.avatar }
        toast.success('Avatar updated!')
      })

      .addCase(changePassword.fulfilled, () => {
        toast.success('Password changed successfully!')
      })
      .addCase(changePassword.rejected, (_, action) => {
        toast.error(action.payload)
      })

      .addCase(forgotPassword.fulfilled, (_, action) => {
        toast.success(action.payload.message)
      })
      .addCase(forgotPassword.rejected, (_, action) => {
        toast.error(action.payload)
      })

      .addCase(resetPassword.fulfilled, (state, action) => {
        state.token = action.payload.token
        localStorage.setItem('token', action.payload.token)
        toast.success('Password reset successfully!')
      })
      .addCase(resetPassword.rejected, (_, action) => {
        toast.error(action.payload)
      })

      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (state.user) {
          state.user = { ...state.user, wishlist: action.payload.wishlist || [] }
        }
        toast.success(action.payload.message || 'Wishlist updated!')
      })

      .addCase(resendVerification.fulfilled, (_, action) => {
        toast.success(action.payload.message, { id: 'verify-resend' })
      })
      .addCase(resendVerification.rejected, (_, action) => {
        toast.error(action.payload, { id: 'verify-resend-error' })
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isInitialized = true
        toast.success('Logged out successfully')
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.isInitialized = true
      })
  },
})

export const { logout, clearError, setUser, setInitialized } = authSlice.actions
export default authSlice.reducer
