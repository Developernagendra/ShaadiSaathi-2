import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const generateOpenAIWeddingPlan = createAsyncThunk(
  'feature/generateOpenAIWeddingPlan',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/wedding-planner', data);
      // Backend now ALWAYS returns 200 OK. We just pass the entire data object
      // which includes { aiPlan, localVendors, meta, fallback }
      return response.data.data; 
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || 'AI Planner is temporarily unavailable. Please try again later.';
      return rejectWithValue(msg);
    }
  }
);

export const fetchGuests = createAsyncThunk(
  'feature/fetchGuests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/features/guests');
      return response.data.data.guests;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to fetch guests');
      return rejectWithValue(msg);
    }
  }
);

export const importGuests = createAsyncThunk(
  'feature/importGuests',
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/features/guests/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(fetchGuests());
      return response.data;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to import guests');
      return rejectWithValue(msg);
    }
  }
);

export const exportGuests = createAsyncThunk(
  'feature/exportGuests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/features/guests/export', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'guests.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to export guests');
      return rejectWithValue(msg);
    }
  }
);

export const fetchChecklist = createAsyncThunk(
  'feature/fetchChecklist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/features/checklist');
      return response.data.data.checklist;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to fetch checklist');
      return rejectWithValue(msg);
    }
  }
);

export const fetchLeads = createAsyncThunk(
  'feature/fetchLeads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/features/leads');
      return response.data.data.leads;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to fetch leads');
      return rejectWithValue(msg);
    }
  }
);

export const fetchNearbyLeads = createAsyncThunk(
  'feature/fetchNearbyLeads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/features/leads/nearby');
      return response.data.data.leads;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to fetch nearby leads');
      return rejectWithValue(msg);
    }
  }
);

export const fetchBlogs = createAsyncThunk(
  'feature/fetchBlogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/features/blogs');
      return response.data.data.blogs;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to fetch blogs');
      return rejectWithValue(msg);
    }
  }
);

export const fetchTestimonials = createAsyncThunk(
  'feature/fetchTestimonials',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/features/testimonials');
      return response.data.data.testimonials;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to fetch testimonials');
      return rejectWithValue(msg);
    }
  }
);

export const fetchHomeStats = createAsyncThunk(
  'feature/fetchHomeStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/features/stats');
      return response.data.data.stats;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to fetch stats');
      return rejectWithValue(msg);
    }
  }
);

export const createLead = createAsyncThunk(
  'feature/createLead',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/features/leads', data);
      dispatch(fetchLeads());
      return response.data.data.lead;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to create lead');
      return rejectWithValue(msg);
    }
  }
);

export const submitQuotation = createAsyncThunk(
  'feature/submitQuotation',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/features/leads/quote', data);
      dispatch(fetchNearbyLeads());
      return response.data.data.lead;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to submit quotation');
      return rejectWithValue(msg);
    }
  }
);

export const updateChecklistTask = createAsyncThunk(
  'feature/updateChecklistTask',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.patch('/features/checklist/task', data);
      return response.data.data.checklist;
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message || (typeof error === 'string' ? error : 'Failed to update checklist task');
      return rejectWithValue(msg);
    }
  }
);

const featureSlice = createSlice({
  name: 'feature',
  initialState: {
    aiRecommendations: null,
    guests: [],
    leads: [],
    checklist: null,
    blogs: [],
    testimonials: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateOpenAIWeddingPlan.pending, (state) => { 
        state.loading = true; 
        state.error = null;
      })
      .addCase(generateOpenAIWeddingPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.aiRecommendations = action.payload;
        state.error = null;
      })
      .addCase(generateOpenAIWeddingPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.guests = action.payload;
      })
      .addCase(fetchChecklist.fulfilled, (state, action) => {
        state.checklist = action.payload;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.leads = action.payload;
      })
      .addCase(fetchNearbyLeads.fulfilled, (state, action) => {
        state.leads = action.payload;
      })
      .addCase(updateChecklistTask.fulfilled, (state, action) => {
        state.checklist = action.payload;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })
      .addCase(submitQuotation.fulfilled, (state, action) => {
        const index = state.leads.findIndex(l => l._id === action.payload._id);
        if (index !== -1) state.leads[index] = action.payload;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.blogs = action.payload;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.testimonials = action.payload;
      })
      .addCase(fetchHomeStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export default featureSlice.reducer;
