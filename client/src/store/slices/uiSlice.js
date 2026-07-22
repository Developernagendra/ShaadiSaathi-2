import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    mobileMenuOpen: false,
    darkMode: false,
    searchQuery: '',
    searchCity: '',
    cartItems: [],
    cartOpen: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false },
    toggleDarkMode: (state) => { state.darkMode = !state.darkMode },
    setSearchQuery: (state, action) => { state.searchQuery = action.payload },
    setSearchCity: (state, action) => { state.searchCity = action.payload },
    addToCart: (state, action) => {
      const exists = state.cartItems.find(i => i._id === action.payload._id)
      if (!exists) state.cartItems.push(action.payload)
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(i => i._id !== action.payload)
    },
    clearCart: (state) => { state.cartItems = [] },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen },
  },
})

export const { toggleSidebar, toggleMobileMenu, closeMobileMenu, toggleDarkMode, setSearchQuery, setSearchCity, addToCart, removeFromCart, clearCart, toggleCart } = uiSlice.actions
export default uiSlice.reducer
