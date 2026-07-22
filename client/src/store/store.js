import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import vendorReducer from './slices/vendorSlice'
import bookingReducer from './slices/bookingSlice'
import uiReducer from './slices/uiSlice'
import notificationReducer from './slices/notificationSlice'
import chatReducer from './slices/chatSlice'
import featureReducer from './slices/featureSlice'
import availabilityReducer from './slices/availabilitySlice'
import invitationReducer from './slices/invitationSlice'

import packageReducer from './slices/packageSlice'
import expertReducer from './slices/expertSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vendor: vendorReducer,
    booking: bookingReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    chat: chatReducer,
    feature: featureReducer,
    availability: availabilityReducer,
    invitation: invitationReducer,
    packages: packageReducer,
    expert: expertReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess', 'auth/registerSuccess'],
      },
    }),
})

export default store
