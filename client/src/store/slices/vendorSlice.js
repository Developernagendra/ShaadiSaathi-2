// vendorSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export const fetchVendors = createAsyncThunk('vendor/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/vendors', { params })
    const vendors = res.data.vendors || res.data.data?.vendors
    const pagination = res.data.pagination || res.data.data?.pagination
    return { ...res.data, vendors, pagination }
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch vendors');
    return rejectWithValue(msg)
  }
})

export const fetchServices = createAsyncThunk('vendor/fetchServices', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/services', { params })
    const services = res.data.services || res.data.data?.services
    const pagination = res.data.pagination || res.data.data?.pagination
    return { ...res.data, services, pagination }
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch services');
    return rejectWithValue(msg)
  }
})

export const fetchVendorById = createAsyncThunk('vendor/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/vendors/${id}`)
    const vendor = res.data.vendor || res.data.data?.vendor
    return { ...res.data, vendor }
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Vendor not found');
    return rejectWithValue(msg)
  }
})

export const fetchMyVendorProfile = createAsyncThunk(
  'vendor/fetchMyProfile',
  async (vendorId, { rejectWithValue }) => {
    try {
      const res = await api.get('/vendors/profile', { params: { vendorId } })
      const vendor = res.data.vendor || res.data.data?.vendor
      return { ...res.data, vendor }
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch profile');
      return rejectWithValue(msg)
    }
  },
  {
    condition: (arg, { getState }) => {
      const { vendor } = getState()
      const isForce = typeof arg === 'object' && arg !== null && arg.force;
      const targetVendorId = typeof arg === 'string' ? arg : (arg?.vendorId || null);
      if (vendor.myVendorProfile && !targetVendorId && !isForce) {
        return false
      }
    }
  }
);

export const createVendorProfile = createAsyncThunk('vendor/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/vendors', data)
    const vendor = res.data.vendor || res.data.data?.vendor
    return { ...res.data, vendor }
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to create vendor profile');
    return rejectWithValue(msg)
  }
})

export const updateVendorProfile = createAsyncThunk('vendor/update', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/vendors/profile', data)
    const vendor = res.data.vendor || res.data.data?.vendor
    return { ...res.data, vendor }
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Update failed');
    return rejectWithValue(msg)
  }
})

export const fetchVendorDashboard = createAsyncThunk(
  'vendor/dashboard',
  async (arg, { rejectWithValue }) => {
    try {
      const targetVendorId = typeof arg === 'string' ? arg : (arg?.vendorId || null);
      const res = await api.get('/vendors/dashboard', { params: { vendorId: targetVendorId } })
      const dashboard = res.data || res.data.data
      const vendor = res.data.vendor || res.data.data?.vendor
      return { ...res.data, dashboard, vendor }
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch dashboard');
      return rejectWithValue(msg)
    }
  },
  {
    condition: (arg, { getState }) => {
      const { vendor } = getState()
      const isForce = typeof arg === 'object' && arg !== null && arg.force;
      const targetVendorId = typeof arg === 'string' ? arg : (arg?.vendorId || null);
      if (vendor.dashboard && !targetVendorId && !isForce) {
        return false
      }
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'vendor/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/categories')
      const categories = res.data.categories || res.data.data?.categories || res.data.data
      return { ...res.data, categories }
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Failed to fetch categories');
      return rejectWithValue(msg)
    }
  },
  {
    condition: (_, { getState }) => {
      const { vendor } = getState()
      if (vendor.categories && vendor.categories.length > 0) {
        return false
      }
    }
  }
);

export const uploadVendorImages = createAsyncThunk('vendor/uploadImages', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/vendors/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Image upload failed');
    return rejectWithValue(msg)
  }
})

export const uploadVendorCoverImage = createAsyncThunk('vendor/uploadCoverImage', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post('/vendors/cover-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  } catch (err) {
    const msg = err?.message || err?.response?.data?.message || (typeof err === 'string' ? err : 'Cover image upload failed');
    return rejectWithValue(msg)
  }
})

const vendorSlice = createSlice({
  name: 'vendor',
  initialState: {
    vendors: [],
    services: [],
    currentVendor: null,
    myVendorProfile: null,
    dashboard: null,
    categories: [],
    pagination: null,
    fetchLoading: false,
    actionLoading: false,
    dashboardLoading: false,
    error: null,
    filters: { city: '', category: '', minPrice: '', maxPrice: '', rating: '', sortBy: 'createdAt' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload } },
    clearFilters: (state) => { state.filters = { city: '', category: '', minPrice: '', maxPrice: '', rating: '', sortBy: 'createdAt' } },
    clearCurrentVendor: (state) => {
      state.currentVendor = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendors.pending, (state) => { state.fetchLoading = true })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.fetchLoading = false
        state.vendors = action.payload.vendors
        state.pagination = action.payload.pagination
      })
      .addCase(fetchVendors.rejected, (state, action) => { state.fetchLoading = false; state.error = action.payload })

      .addCase(fetchServices.pending, (state) => { state.fetchLoading = true })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.fetchLoading = false
        state.services = action.payload.services
        state.pagination = action.payload.pagination
      })
      .addCase(fetchServices.rejected, (state, action) => { state.fetchLoading = false; state.error = action.payload })

      .addCase(fetchVendorById.pending, (state) => { state.fetchLoading = true })
      .addCase(fetchVendorById.fulfilled, (state, action) => { state.fetchLoading = false; state.currentVendor = action.payload.vendor })
      .addCase(fetchVendorById.rejected, (state, action) => { state.fetchLoading = false; state.error = action.payload })

      .addCase(fetchMyVendorProfile.pending, (state) => { state.fetchLoading = true })
      .addCase(fetchMyVendorProfile.fulfilled, (state, action) => {
        state.fetchLoading = false
        state.myVendorProfile = action.payload.vendor
      })
      .addCase(fetchMyVendorProfile.rejected, (state) => { state.fetchLoading = false })

      .addCase(createVendorProfile.pending, (state) => { state.actionLoading = true })
      .addCase(createVendorProfile.fulfilled, (state, action) => {
        state.actionLoading = false
        state.myVendorProfile = action.payload.vendor
        toast.success('Vendor profile created! Awaiting approval.')
      })
      .addCase(createVendorProfile.rejected, (state, action) => {
        state.actionLoading = false
        toast.error(action.payload)
      })

      .addCase(updateVendorProfile.pending, (state) => { state.actionLoading = true })
      .addCase(updateVendorProfile.fulfilled, (state, action) => {
        state.actionLoading = false
        state.myVendorProfile = action.payload.vendor
        toast.success('Profile updated!')
      })
      .addCase(updateVendorProfile.rejected, (state) => { state.actionLoading = false })

      .addCase(fetchVendorDashboard.pending, (state) => { state.dashboardLoading = true })
      .addCase(fetchVendorDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false
        state.dashboard = action.payload
        if (action.payload.vendor) {
          state.myVendorProfile = action.payload.vendor
        }
      })
      .addCase(fetchVendorDashboard.rejected, (state) => { state.dashboardLoading = false })

      .addCase(uploadVendorCoverImage.pending, (state) => { state.actionLoading = true })
      .addCase(uploadVendorCoverImage.fulfilled, (state, action) => {
        state.actionLoading = false
        if (state.myVendorProfile) {
          state.myVendorProfile.coverImage = action.payload.coverImage
        }
        toast.success('Cover image updated!')
      })
      .addCase(uploadVendorCoverImage.rejected, (state, action) => {
        state.actionLoading = false
        toast.error(action.payload)
      })

      .addCase(uploadVendorImages.pending, (state) => { state.actionLoading = true })
      .addCase(uploadVendorImages.fulfilled, (state, action) => {
        state.actionLoading = false
        if (state.myVendorProfile) {
          state.myVendorProfile.images = action.payload.images
        }
        toast.success('Gallery updated!')
      })
      .addCase(uploadVendorImages.rejected, (state, action) => {
        state.actionLoading = false
        toast.error(action.payload)
      })

      .addCase(fetchCategories.pending, (state) => {
        state.fetchLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.fetchLoading = false
        state.categories = action.payload?.categories || []
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.fetchLoading = false
        state.error = action.payload
      })
      .addCase('auth/logout/fulfilled', (state) => {
        state.vendors = []
        state.services = []
        state.currentVendor = null
        state.myVendorProfile = null
        state.dashboard = null
        state.pagination = null
        state.fetchLoading = false
        state.actionLoading = false
        state.dashboardLoading = false
        state.error = null
      })
  },
})

export const { setFilters, clearFilters, clearCurrentVendor } = vendorSlice.actions
export default vendorSlice.reducer
