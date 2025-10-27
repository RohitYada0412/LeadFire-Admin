import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import leadsReducer from './features/leads/leadsSlice'

export default configureStore({
  reducer: {
    auth: authReducer,
    leads: leadsReducer
  }
})
