import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// Create booking
export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post("/bookings", bookingData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create booking",
      );
    }
  },
);

// Get exporter's bookings
export const getMyBookings = createAsyncThunk(
  "bookings/getMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/bookings/");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookings",
      );
    }
  },
);

// Get a specific booking
export const getBookingById = createAsyncThunk(
  "bookings/getBookingById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bookings/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch booking",
      );
    }
  },
);

// Get provider booking requests
export const getProviderBookings = createAsyncThunk(
  "bookings/getProviderBookings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/bookings/provider/requests");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch booking requests",
      );
    }
  },
);

// Get provider booking history
export const getProviderBookingHistory = createAsyncThunk(
  "bookings/getProviderBookingHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/bookings/provider/history");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch booking history",
      );
    }
  },
);

// Approve booking
export const approveBooking = createAsyncThunk(
  "bookings/approveBooking",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/bookings/${id}/approve`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve booking",
      );
    }
  },
);

// Reject booking
export const rejectBooking = createAsyncThunk(
  "bookings/rejectBooking",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/bookings/${id}/reject`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject booking",
      );
    }
  },
);

// Cancel booking
export const cancelBooking = createAsyncThunk(
  "bookings/cancelBooking",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel booking",
      );
    }
  },
);

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "bookings",

  initialState,

  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },

    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings.unshift(action.payload.booking);
        state.error = null;
      })

      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get my bookings
      .addCase(getMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.error = null;
      })

      .addCase(getMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get booking by ID
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload.booking;
        state.error = null;
      })

      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get provider bookings
      .addCase(getProviderBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getProviderBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.error = null;
      })

      .addCase(getProviderBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get provider booking history
      .addCase(getProviderBookingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getProviderBookingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.error = null;
      })

      .addCase(getProviderBookingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Approve booking
      .addCase(approveBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(approveBooking.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.bookings.findIndex(
          (booking) => booking._id === action.payload.booking._id,
        );

        if (index !== -1) {
          state.bookings[index] = action.payload.booking;
        }

        state.error = null;
      })

      .addCase(approveBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reject booking
      .addCase(rejectBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.bookings.findIndex(
          (booking) => booking._id === action.payload.booking._id,
        );

        if (index !== -1) {
          state.bookings[index] = action.payload.booking;
        }

        state.error = null;
      })

      .addCase(rejectBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.bookings.findIndex(
          (booking) => booking._id === action.payload.booking._id,
        );

        if (index !== -1) {
          state.bookings[index] = action.payload.booking;
        }

        state.error = null;
      })

      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookingError, clearCurrentBooking } = bookingSlice.actions;

export default bookingSlice.reducer;
