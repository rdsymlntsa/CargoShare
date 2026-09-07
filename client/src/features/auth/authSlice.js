import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", loginData);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Authentication failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/logout");

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.patch("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed",
      );
    }
  },
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  authChecked: false,
};

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.patch("/auth/change-password", passwordData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password change failed",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.error = null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.authChecked = true;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.error = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.authChecked = true;
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })

      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.error = null;
      })

      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })

      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.authChecked = true;
        state.error = null;
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;

export default authSlice.reducer;
