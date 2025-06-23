import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  instrument?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        userData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      // Only attempt to call the API if we have a refresh token
      if (auth.refreshToken) {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`, {
          refreshToken: auth.refreshToken
        });
      }
      
      // Clear local storage regardless of API success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return null;
    } catch (error) {
      // Still clear local storage even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      
      // Update localStorage
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    }
  },
  extraReducers: (builder) => {
    // Register cases
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Login cases
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      
      // Save tokens to localStorage
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // Logout cases
    builder.addCase(logout.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    });
    builder.addCase(logout.rejected, (state) => {
      state.loading = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    });
  }
});

export const { clearError, setTokens } = authSlice.actions;

export default authSlice.reducer;
