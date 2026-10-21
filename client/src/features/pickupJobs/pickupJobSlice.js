import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// Create a pickup job
export const createPickupJob = createAsyncThunk(
  "pickupJobs/createPickupJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await api.post("/pickup-jobs", jobData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create pickup job",
      );
    }
  },
);

// Get the exporter's pickup jobs
export const getMyPickupJobs = createAsyncThunk(
  "pickupJobs/getMyPickupJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/pickup-jobs/mine");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your pickup jobs",
      );
    }
  },
);

// Get open pickup jobs
export const getOpenPickupJobs = createAsyncThunk(
  "pickupJobs/getOpenPickupJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/pickup-jobs/open");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch open pickup jobs",
      );
    }
  },
);

// Find jobs matching a trip
export const getMatchedPickupJobs = createAsyncThunk(
  "pickupJobs/getMatchedPickupJobs",
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/pickup-jobs/matches/${tripId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to find matching pickup jobs",
      );
    }
  },
);

// Accept a pickup job for a trip
export const acceptPickupJob = createAsyncThunk(
  "pickupJobs/acceptPickupJob",
  async ({ jobId, tripId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/pickup-jobs/${jobId}/accept`, {
        tripId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to accept pickup job",
      );
    }
  },
);

// Cancel an open pickup job
export const cancelPickupJob = createAsyncThunk(
  "pickupJobs/cancelPickupJob",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/pickup-jobs/${id}/cancel`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel pickup job",
      );
    }
  },
);

// Confirm pickup using the verification code
export const verifyPickupCode = createAsyncThunk(
  "pickupJobs/verifyPickupCode",
  async ({ jobId, code }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/pickup-jobs/${jobId}/confirm-pickup`, {
        code,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify pickup code",
      );
    }
  },
);

// Confirm delivery using the verification code
export const verifyDeliveryCode = createAsyncThunk(
  "pickupJobs/verifyDeliveryCode",
  async ({ jobId, code }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/pickup-jobs/${jobId}/confirm-delivery`,
        { code },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to verify delivery code",
      );
    }
  },
);

const initialState = {
  pickupJobs: [],
  matchedJobs: [],
  currentPickupJob: null,
  verificationCodes: null,
  loading: false,
  error: null,
};

const pickupJobSlice = createSlice({
  name: "pickupJobs",
  initialState,

  reducers: {
    clearPickupJobError: (state) => {
      state.error = null;
    },
    clearMatchedJobs: (state) => {
      state.matchedJobs = [];
    },
    clearVerificationCodes: (state) => {
      state.verificationCodes = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Create pickup job
      .addCase(createPickupJob.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.verificationCodes = null;
      })
      .addCase(createPickupJob.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.pickupJob) {
          state.pickupJobs.unshift(action.payload.pickupJob);
        }

        state.verificationCodes = action.payload.verificationCodes || null;
        state.error = null;
      })
      .addCase(createPickupJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get my pickup jobs
      .addCase(getMyPickupJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPickupJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupJobs = action.payload.pickupJobs;
        state.error = null;
      })
      .addCase(getMyPickupJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get open pickup jobs
      .addCase(getOpenPickupJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOpenPickupJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupJobs = action.payload.pickupJobs;
        state.error = null;
      })
      .addCase(getOpenPickupJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get matched pickup jobs
      .addCase(getMatchedPickupJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.matchedJobs = [];
      })
      .addCase(getMatchedPickupJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.matchedJobs = action.payload.matches || [];
        state.error = null;
      })
      .addCase(getMatchedPickupJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Accept pickup job
      .addCase(acceptPickupJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptPickupJob.fulfilled, (state, action) => {
        state.loading = false;

        const acceptedJob = action.payload.pickupJob;

        if (acceptedJob) {
          state.pickupJobs = state.pickupJobs.filter(
            (job) => job._id !== acceptedJob._id,
          );
          state.matchedJobs = state.matchedJobs.filter(
            (match) => match.pickupJob?._id !== acceptedJob._id,
          );
        }

        state.error = null;
      })
      .addCase(acceptPickupJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel pickup job
      .addCase(cancelPickupJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelPickupJob.fulfilled, (state, action) => {
        state.loading = false;

        const updatedJob = action.payload.pickupJob;

        if (updatedJob) {
          const index = state.pickupJobs.findIndex(
            (job) => job._id === updatedJob._id,
          );

          if (index !== -1) {
            state.pickupJobs[index] = updatedJob;
          }
        }

        state.error = null;
      })
      .addCase(cancelPickupJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify pickup code
      .addCase(verifyPickupCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPickupCode.fulfilled, (state, action) => {
        state.loading = false;

        const updatedJob = action.payload.pickupJob;

        if (updatedJob) {
          const index = state.pickupJobs.findIndex(
            (job) => job._id === updatedJob._id,
          );

          if (index !== -1) {
            state.pickupJobs[index] = updatedJob;
          }
        }

        state.error = null;
      })
      .addCase(verifyPickupCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify delivery code
      .addCase(verifyDeliveryCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyDeliveryCode.fulfilled, (state, action) => {
        state.loading = false;

        const updatedJob = action.payload.pickupJob;

        if (updatedJob) {
          const index = state.pickupJobs.findIndex(
            (job) => job._id === updatedJob._id,
          );

          if (index !== -1) {
            state.pickupJobs[index] = updatedJob;
          }
        }

        state.error = null;
      })
      .addCase(verifyDeliveryCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPickupJobError, clearMatchedJobs, clearVerificationCodes } =
  pickupJobSlice.actions;

export default pickupJobSlice.reducer;
