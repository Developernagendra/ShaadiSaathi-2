import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async Thunks
export const fetchPackages = createAsyncThunk(
  'package/fetchPackages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/packages');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load packages');
    }
  }
);

export const submitPackageInquiry = createAsyncThunk(
  'package/submitInquiry',
  async (inquiryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/package-inquiries', inquiryData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit inquiry');
    }
  }
);

export const fetchAdminPackages = createAsyncThunk(
  'package/fetchAdminPackages',
  async (_, { rejectWithValue }) => {
    try {
      // Admins should see all packages regardless of status/visibility
      const response = await api.get('/packages');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load packages');
    }
  }
);

export const createPackage = createAsyncThunk(
  'package/createPackage',
  async (packageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/packages', packageData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create package');
    }
  }
);

export const updatePackage = createAsyncThunk(
  'package/updatePackage',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/packages/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update package');
    }
  }
);

export const deletePackage = createAsyncThunk(
  'package/deletePackage',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/packages/${id}`);
      return id; // return id to remove from state
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete package');
    }
  }
);

export const fetchAdminInquiries = createAsyncThunk(
  'package/fetchAdminInquiries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/package-inquiries');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load inquiries');
    }
  }
);

export const updatePackageInquiry = createAsyncThunk(
  'package/updateInquiry',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/package-inquiries/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update inquiry');
    }
  }
);

export const deletePackageInquiry = createAsyncThunk(
  'package/deleteInquiry',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/package-inquiries/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete inquiry');
    }
  }
);

const initialState = {
  packages: [],
  inquiries: [],
  loading: false,
  error: null,
  inquirySuccess: false,
};

const packageSlice = createSlice({
  name: 'package',
  initialState,
  reducers: {
    resetInquirySuccess: (state) => {
      state.inquirySuccess = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Packages
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit Inquiry
      .addCase(submitPackageInquiry.pending, (state) => {
        state.loading = true;
        state.inquirySuccess = false;
        state.error = null;
      })
      .addCase(submitPackageInquiry.fulfilled, (state) => {
        state.loading = false;
        state.inquirySuccess = true;
      })
      .addCase(submitPackageInquiry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Admin Inquiries
      .addCase(fetchAdminInquiries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminInquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.inquiries = action.payload;
      })
      .addCase(fetchAdminInquiries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Admin Packages
      .addCase(fetchAdminPackages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(fetchAdminPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Package
      .addCase(createPackage.fulfilled, (state, action) => {
        state.packages.unshift(action.payload);
      })
      // Update Package
      .addCase(updatePackage.fulfilled, (state, action) => {
        const index = state.packages.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.packages[index] = action.payload;
        }
      })
      // Delete Package
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.packages = state.packages.filter(p => p._id !== action.payload);
      })
      // Update Inquiry
      .addCase(updatePackageInquiry.fulfilled, (state, action) => {
        const index = state.inquiries.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.inquiries[index] = action.payload;
        }
      })
      // Delete Inquiry
      .addCase(deletePackageInquiry.fulfilled, (state, action) => {
        state.inquiries = state.inquiries.filter(i => i._id !== action.payload);
      });
  }
});

export const { resetInquirySuccess } = packageSlice.actions;
export default packageSlice.reducer;
