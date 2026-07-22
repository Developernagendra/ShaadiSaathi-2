import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export const fetchVendorAvailability = createAsyncThunk('availability/fetchVendor', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/availability/vendor', { params })
    return res.data.availability
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch availability');
    return rejectWithValue(msg)
  }
})

export const fetchPublicAvailability = createAsyncThunk('availability/fetchPublic', async ({ vendorId, params }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/availability/vendors/${vendorId}`, { params })
    return res.data.availability
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch availability');
    return rejectWithValue(msg)
  }
})

export const updateAvailability = createAsyncThunk('availability/update', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/availability', data)
    toast.success('Availability updated')
    return res.data.availability
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to update availability');
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

export const bulkUpdateAvailability = createAsyncThunk('availability/bulkUpdate', async (data, { rejectWithValue }) => {
  try {
    await api.post('/availability/bulk', data)
    toast.success('Bulk availability updated')
    return data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to update availability');
    toast.error(msg)
    return rejectWithValue(msg)
  }
})

const availabilitySlice = createSlice({
  name: 'availability',
  initialState: {
    vendorAvailability: [],
    publicAvailability: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAvailability: (state) => {
      state.vendorAvailability = []
      state.publicAvailability = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorAvailability.pending, (state) => { state.loading = true })
      .addCase(fetchVendorAvailability.fulfilled, (state, action) => {
        state.loading = false
        state.vendorAvailability = action.payload
      })
      .addCase(fetchVendorAvailability.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(fetchPublicAvailability.pending, (state) => { state.loading = true })
      .addCase(fetchPublicAvailability.fulfilled, (state, action) => {
        state.loading = false
        state.publicAvailability = action.payload
      })
      .addCase(fetchPublicAvailability.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(updateAvailability.fulfilled, (state, action) => {
        const index = state.vendorAvailability.findIndex(a => a._id === action.payload._id)
        if (index !== -1) state.vendorAvailability[index] = action.payload
        else state.vendorAvailability.push(action.payload)
      })
  }
})

export const { clearAvailability } = availabilitySlice.actions
export default availabilitySlice.reducer
