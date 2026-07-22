import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const TEMPLATE_DATA = [
  { id: 't1', name: 'Traditional', img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80' },
  { id: 't2', name: 'Modern', img: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=400&q=80' },
  { id: 't3', name: 'Royal', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&q=80' },
  { id: 't4', name: 'Minimal', img: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=400&q=80' },
  { id: 't5', name: 'Luxury', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=80' },
  { id: 't6', name: 'Floral', img: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=400&q=80' },
];

const defaultInvitation = {
  brideName: '',
  groomName: '',
  weddingDate: '',
  weddingTime: '',
  venue: '',
  city: '',
  googleMapLink: '',
  customMessage: '',
  ourStory: '',
  template: 't1',
  coverPhoto: '',
  status: 'draft',
};

// Async Thunks
export const fetchInvitations = createAsyncThunk(
  'invitation/fetchInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/invitations');
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch invitations');
    }
  }
);

export const createInvitation = createAsyncThunk(
  'invitation/createInvitation',
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post('/invitations', data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create invitation');
    }
  }
);

export const updateInvitation = createAsyncThunk(
  'invitation/updateInvitation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/invitations/${id}`, data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update invitation');
    }
  }
);

export const deleteInvitation = createAsyncThunk(
  'invitation/deleteInvitation',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/invitations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete invitation');
    }
  }
);

const invitationSlice = createSlice({
  name: 'invitation',
  initialState: {
    invitations: [],
    templates: TEMPLATE_DATA,
    currentInvitation: { ...defaultInvitation },
    loading: false,
    error: null,
  },
  reducers: {
    updateField: (state, action) => {
      state.currentInvitation = { ...state.currentInvitation, ...action.payload };
    },
    resetBuilder: (state) => {
      state.currentInvitation = { ...defaultInvitation };
    },
    loadInvitation: (state, action) => {
      state.currentInvitation = { ...defaultInvitation, ...action.payload };
    },
    selectTemplate: (state, action) => {
      state.currentInvitation.template = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchInvitations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInvitations.fulfilled, (state, action) => { state.loading = false; state.invitations = action.payload; })
      .addCase(fetchInvitations.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Create
      .addCase(createInvitation.pending, (state) => { state.loading = true; })
      .addCase(createInvitation.fulfilled, (state, action) => { state.loading = false; state.invitations.unshift(action.payload); })
      .addCase(createInvitation.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // Update
      .addCase(updateInvitation.fulfilled, (state, action) => {
        const idx = state.invitations.findIndex(i => i._id === action.payload._id);
        if (idx >= 0) state.invitations[idx] = { ...state.invitations[idx], ...action.payload };
      })
      // Delete
      .addCase(deleteInvitation.fulfilled, (state, action) => {
        state.invitations = state.invitations.filter(i => i._id !== action.payload);
      });
  },
});

export const { updateField, resetBuilder, loadInvitation, selectTemplate } = invitationSlice.actions;
export default invitationSlice.reducer;
