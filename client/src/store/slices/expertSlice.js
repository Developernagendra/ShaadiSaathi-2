import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const submitExpertConsultation = createAsyncThunk(
  'expert/submitConsultation',
  async (consultationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/expert-consultations', consultationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit consultation');
    }
  }
);

export const fetchAdminConsultations = createAsyncThunk(
  'expert/fetchAdminConsultations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/expert-consultations');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch consultations');
    }
  }
);

export const updateConsultationStatus = createAsyncThunk(
  'expert/updateConsultationStatus',
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/expert-consultations/${id}`, { status, note });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update consultation');
    }
  }
);

export const deleteConsultation = createAsyncThunk(
  'expert/deleteConsultation',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/expert-consultations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete consultation');
    }
  }
);

const initialState = {
  consultations: [],
  loading: false,
  error: null,
  success: false,
};

const expertSlice = createSlice({
  name: 'expert',
  initialState,
  reducers: {
    resetExpertSuccess: (state) => {
      state.success = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitExpertConsultation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitExpertConsultation.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(submitExpertConsultation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminConsultations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminConsultations.fulfilled, (state, action) => {
        state.loading = false;
        state.consultations = action.payload;
      })
      .addCase(fetchAdminConsultations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateConsultationStatus.fulfilled, (state, action) => {
        const index = state.consultations.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.consultations[index] = action.payload;
        }
      })
      .addCase(deleteConsultation.fulfilled, (state, action) => {
        state.consultations = state.consultations.filter(c => c._id !== action.payload);
      });
  }
});

export const { resetExpertSuccess } = expertSlice.actions;
export default expertSlice.reducer;
