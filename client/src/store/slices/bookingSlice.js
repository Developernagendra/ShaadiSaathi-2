import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export const createBooking = createAsyncThunk('booking/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/bookings', data)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Booking failed');
    return rejectWithValue(msg)
  }
})

export const fetchMyBookings = createAsyncThunk('booking/fetchMine', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/my-bookings', { params })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch bookings');
    return rejectWithValue(msg)
  }
})

export const fetchVendorBookings = createAsyncThunk('booking/fetchVendor', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/vendor/services', { params })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch vendor bookings');
    return rejectWithValue(msg)
  }
})

export const fetchBookingById = createAsyncThunk('booking/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/bookings/${id}`)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch booking');
    return rejectWithValue(msg)
  }
})

export const updateBookingStatus = createAsyncThunk('booking/updateStatus', async ({ id, status, note }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/bookings/${id}/status`, { status, note })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to update status');
    return rejectWithValue(msg)
  }
})

export const updateCabBookingStatus = createAsyncThunk('booking/updateCabStatus', async ({ id, status, note }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/cab-booking/${id}/status`, { status, note })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to update cab status');
    return rejectWithValue(msg)
  }
})

export const cancelBooking = createAsyncThunk('booking/cancel', async ({ id, reason }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/bookings/${id}/cancel`, { reason })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to cancel booking');
    return rejectWithValue(msg)
  }
})

export const fetchAdminBookings = createAsyncThunk('booking/fetchAdmin', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/bookings', { params })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch admin bookings');
    return rejectWithValue(msg)
  }
})

export const fetchAdminBookingById = createAsyncThunk('booking/fetchAdminById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/admin/bookings/${id}`)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch admin booking');
    return rejectWithValue(msg)
  }
})

export const deleteBooking = createAsyncThunk('booking/delete', async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/bookings/${id}`)
    return { id, message: res.data.message }
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to delete booking');
    return rejectWithValue(msg)
  }
})

export const createCabBooking = createAsyncThunk('booking/createCab', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/cab-booking', data)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Cab booking failed');
    return rejectWithValue(msg)
  }
})

export const fetchMyCabBookings = createAsyncThunk('booking/fetchMyCabs', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/cab-booking/my-bookings', { params })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch cab bookings');
    return rejectWithValue(msg)
  }
})

export const fetchCabs = createAsyncThunk('booking/fetchCabs', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/cab-booking', { params })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch cabs');
    return rejectWithValue(msg)
  }
})

export const fetchCabBookingById = createAsyncThunk('booking/fetchCabById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/cab-booking/${id}`)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch cab booking');
    return rejectWithValue(msg)
  }
})

export const fetchCabDetails = createAsyncThunk('booking/fetchCabDetails', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/cab-booking/details/${id}`)
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch cab details');
    return rejectWithValue(msg)
  }
})

export const fetchVendorCabs = createAsyncThunk('booking/fetchVendorCabs', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/cab-booking/vendor-cabs')
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch vendor cabs');
    return rejectWithValue(msg)
  }
})

export const deleteCab = createAsyncThunk('booking/deleteCab', async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/cab-booking/manage/${id}`)
    return { id, message: res.data.message }
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to delete cab');
    return rejectWithValue(msg)
  }
})

export const fetchVendorCabBookings = createAsyncThunk('booking/fetchVendorCabBookings', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/vendor/cabs', { params })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch vendor cab bookings');
    return rejectWithValue(msg)
  }
})

export const fetchUserDashboard = createAsyncThunk('booking/fetchUserDashboard', async (userId, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/user-dashboard', { params: { userId } })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch user dashboard');
    return rejectWithValue(msg)
  }
})

const bookingSlice = createSlice({
  name: 'booking',
  initialState: {
    bookings: [],
    cabBookings: [],
    userDashboard: null,
    vendorBookings: [],
    vendorCabBookings: [],
    adminBookings: [],
    currentBooking: null,
    currentCabBooking: null,
    pagination: null,
    counts: { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, in_progress: 0 },
    serviceCounts: { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, in_progress: 0 },
    cabCounts: { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, in_progress: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentBooking: (state) => { state.currentBooking = null },
    updateLocalBooking: (state, action) => {
      const b = action.payload;
      const findAndReplace = (arr) => {
        if (!arr) return;
        const idx = arr.findIndex(item => item._id === b._id);
        if (idx !== -1) arr[idx] = b;
      };
      findAndReplace(state.bookings);
      findAndReplace(state.vendorBookings);
      findAndReplace(state.adminBookings);
      findAndReplace(state.cabBookings);
      findAndReplace(state.vendorCabBookings);
      if (state.currentBooking?._id === b._id) state.currentBooking = b;
      if (state.currentCabBooking?._id === b._id) state.currentCabBooking = b;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDashboard.pending, (state) => { state.loading = true })
      .addCase(fetchUserDashboard.fulfilled, (state, action) => {
        state.loading = false
        state.userDashboard = action.payload
        state.bookings = action.payload.recentBookings
        state.cabBookings = action.payload.recentCabBookings
        if (action.payload.stats) {
          const stats = {
            all: action.payload.stats.totalBookings || 0,
            pending: action.payload.stats.pendingBookings || 0,
            confirmed: action.payload.stats.confirmedBookings || 0,
            completed: action.payload.stats.completedBookings || 0,
            cancelled: action.payload.stats.cancelledBookings || 0,
            in_progress: action.payload.stats.inProgressBookings || 0
          };
          state.serviceCounts = stats;
          state.counts = stats;
        }
      })
      .addCase(fetchUserDashboard.rejected, (state) => { state.loading = false })

      .addCase(createBooking.pending, (state) => { state.loading = true })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false
        state.currentBooking = action.payload.booking
        toast.success('Booking created successfully!', { id: 'booking-success' })
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false
        toast.error(action.payload, { id: 'booking-error' })
      })

      .addCase(fetchMyBookings.pending, (state) => { state.loading = true })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false
        state.bookings = action.payload.bookings || []
        state.pagination = action.payload.pagination
        const newCounts = action.payload.counts || state.serviceCounts;
        state.serviceCounts = newCounts;
        state.counts = newCounts;
      })
      .addCase(fetchMyBookings.rejected, (state) => { state.loading = false })

      .addCase(fetchMyCabBookings.pending, (state) => { state.loading = true })
      .addCase(fetchMyCabBookings.fulfilled, (state, action) => {
        state.loading = false
        state.cabBookings = action.payload.bookings || []
        const newCounts = action.payload.counts || state.cabCounts;
        state.cabCounts = newCounts;
        state.counts = newCounts;
      })
      .addCase(fetchMyCabBookings.rejected, (state) => { state.loading = false })

      .addCase(fetchVendorCabBookings.pending, (state) => { state.loading = true })
      .addCase(fetchVendorCabBookings.fulfilled, (state, action) => {
        state.loading = false
        state.vendorCabBookings = action.payload.bookings || []
        const newCounts = action.payload.counts || state.cabCounts;
        state.cabCounts = newCounts;
        state.counts = newCounts;
      })
      .addCase(fetchVendorCabBookings.rejected, (state) => { state.loading = false })

      .addCase(fetchVendorBookings.pending, (state) => { state.loading = true })
      .addCase(fetchVendorBookings.fulfilled, (state, action) => {
        state.loading = false
        state.vendorBookings = action.payload.bookings || []
        state.pagination = action.payload.pagination
        const newCounts = action.payload.counts || state.serviceCounts;
        state.serviceCounts = newCounts;
        state.counts = newCounts;
      })
      .addCase(fetchVendorBookings.rejected, (state) => { state.loading = false })

      .addCase(fetchBookingById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchBookingById.fulfilled, (state, action) => { 
        state.loading = false
        state.currentBooking = action.payload.booking 
      })
      .addCase(fetchBookingById.rejected, (state, action) => { 
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchCabBookingById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCabBookingById.fulfilled, (state, action) => { 
        state.loading = false
        state.currentCabBooking = action.payload.booking 
      })
      .addCase(fetchCabBookingById.rejected, (state, action) => { 
        state.loading = false
        state.error = action.payload
      })

      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const b = action.payload.booking;
        const idx = state.vendorBookings.findIndex(item => item._id === b._id);
        if (idx !== -1) state.vendorBookings[idx] = b;
        if (state.currentBooking?._id === b._id) state.currentBooking = b;
        toast.success('Booking status updated!')
      })
      .addCase(updateBookingStatus.rejected, (_, action) => { toast.error(action.payload) })

      .addCase(updateCabBookingStatus.fulfilled, (state, action) => {
        const b = action.payload.booking;
        const idx = state.vendorCabBookings.findIndex(item => item._id === b._id)
        if (idx !== -1) state.vendorCabBookings[idx] = b;
        toast.success('Cab booking status updated!')
      })
      .addCase(updateCabBookingStatus.rejected, (_, action) => { toast.error(action.payload) })

      .addCase(cancelBooking.fulfilled, (state, action) => {
        const b = action.payload.booking;
        const idx = state.bookings.findIndex(item => item._id === b._id)
        if (idx !== -1) state.bookings[idx] = b;
        toast.success('Booking cancelled.')
      })

      .addCase(createCabBooking.pending, (state) => { state.loading = true })
      .addCase(createCabBooking.fulfilled, (state, action) => {
        state.loading = false
        state.currentCabBooking = action.payload.booking
        toast.success('Cab booking created successfully!', { id: 'cab-success' })
      })
      .addCase(createCabBooking.rejected, (state, action) => {
        state.loading = false
        toast.error(action.payload, { id: 'cab-error' })
      })

.addCase(fetchAdminBookings.pending, (state) => { state.loading = true })
      .addCase(fetchAdminBookings.fulfilled, (state, action) => {
        state.loading = false
        state.adminBookings = action.payload.bookings || []
        state.pagination = action.payload.pagination
        state.counts = action.payload.counts || state.counts
      })
      .addCase(fetchAdminBookings.rejected, (state) => { state.loading = false })

      .addCase(fetchAdminBookingById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAdminBookingById.fulfilled, (state, action) => {
        state.loading = false
        state.currentBooking = action.payload.booking
      })
      .addCase(fetchAdminBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      })

      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.adminBookings = state.adminBookings.filter(b => b._id !== action.payload.id)
        toast.success(action.payload.message)
      })
  },
})

export const { clearCurrentBooking, updateLocalBooking } = bookingSlice.actions
export default bookingSlice.reducer
