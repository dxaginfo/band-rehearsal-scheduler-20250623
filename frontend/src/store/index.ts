import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bandReducer from './slices/bandSlice';
import rehearsalReducer from './slices/rehearsalSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    bands: bandReducer,
    rehearsals: rehearsalReducer,
    users: userReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
