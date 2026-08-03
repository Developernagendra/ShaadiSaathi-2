import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const TEMPLATE_DATA = [
  { id: 't1', name: 'Traditional Red', category: 'Traditional', badge: '❤️ Traditional', style: 'traditional', img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80', accentColor: '#C2185B', bgGradient: 'from-[#8E244D] via-[#C2185B] to-[#4A1525]' },
  { id: 't2', name: 'Modern Gold', category: 'Modern', badge: '✨ Modern', style: 'modern', img: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80', accentColor: '#D4AF37', bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#0B1021]' },
  { id: 't3', name: 'Royal Heritage', category: 'Royal', badge: '👑 Royal', style: 'royal', img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80', accentColor: '#D4AF37', bgGradient: 'from-[#1E1B4B] via-[#311042] to-[#0F172A]' },
  { id: 't4', name: 'Minimal Ivory', category: 'Minimal', badge: '🌿 Minimal', style: 'minimal', img: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=600&q=80', accentColor: '#475569', bgGradient: 'from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]' },
  { id: 't5', name: 'Luxury Velvet', category: 'Luxury', badge: '💎 Luxury', style: 'luxury', img: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80', accentColor: '#D4AF37', bgGradient: 'from-[#0B1021] via-[#111827] to-[#1F2937]' },
  { id: 't6', name: 'Floral Garden', category: 'Floral', badge: '🌸 Floral', style: 'floral', img: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=600&q=80', accentColor: '#EC4899', bgGradient: 'from-[#FDF2F8] via-[#FCE7F3] to-[#FBCFE8]' },
  { id: 't7', name: 'Mithila Madhubani', category: 'Madhubani / Bihar Inspired', badge: '🎨 Bihar Inspired', style: 'madhubani', img: 'https://images.unsplash.com/photo-1545232972-9bb88a5e6d8a?w=600&q=80', accentColor: '#D4AF37', bgGradient: 'from-[#7C2D12] via-[#9A3412] to-[#431407]' },
  { id: 't8', name: 'Elegant Mandala', category: 'Elegant', badge: '🕌 Elegant', style: 'elegant', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', accentColor: '#059669', bgGradient: 'from-[#064E3B] via-[#065F46] to-[#022C22]' },
];

const defaultInvitation = {
  brideName: '',
  groomName: '',
  weddingDate: '',
  weddingTime: '',
  venue: '',
  city: '',
  brideFamily: '',
  groomFamily: '',
  rsvpPhone: '',
  rsvpName: '',
  googleMapLink: '',
  customMessage: '',
  ourStory: '',
  template: 't1',
  colorTheme: 'royal_gold',
  fontStyle: 'classic',
  decorativeStyle: 'floral',
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
