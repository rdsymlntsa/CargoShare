
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// Create a trip
export const createTrip = createAsyncThunk(
  "trips/createTrip",
  async (tripData, { rejectWithValue }) => {
    try {
      const response = await api.post("/trips", tripData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create trip"
      );
    }
  }
);

// Get your trips
export const getMyTrips = createAsyncThunk(
  "trips/getMyTrips",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/trips/mine");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your trips"
      );
    }
  }
);

// Get available trips
export const getOpenTrips = createAsyncThunk(
  "trips/getOpenTrips",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/trips/open");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch available trips"
      );
    }
  }
);

// Cancel a trip
export const cancelTrip = createAsyncThunk(
  "trips/cancelTrip",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/trips/${id}/cancel`);
      return { ...response.data, id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel trip"
      );
    }
  }
);

const initialState = {
  myTrips: [],
  openTrips: [],
  loading: false,
  error: null,
};

const tripSlice = createSlice({
  name: "trips",
  initialState,

  reducers: {
    clearTripError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Create trip
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload?.trip) {
          state.myTrips.unshift(action.payload.trip);
        }

        state.error = null;
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create trip";
      })

      // Get your trips
      .addCase(getMyTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.myTrips = action.payload?.trips ?? [];
        state.error = null;
      })
      .addCase(getMyTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch your trips";
      })

      // Get open trips
      .addCase(getOpenTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOpenTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.openTrips = action.payload?.trips ?? [];
        state.error = null;
      })
      .addCase(getOpenTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch available trips";
      })

      // Cancel trip
      .addCase(cancelTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelTrip.fulfilled, (state, action) => {
        state.loading = false;

        const tripId = action.payload?.trip?._id || action.payload.id;

        state.myTrips = state.myTrips.map((trip) =>
          trip._id === tripId
            ? { ...trip, status: "cancelled" }
            : trip
        );

        state.openTrips = state.openTrips.filter(
          (trip) => trip._id !== tripId
        );

        state.error = null;
      })
      .addCase(cancelTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to cancel trip";
      });
  },
});

export const { clearTripError } = tripSlice.actions;

export default tripSlice.reducer;
