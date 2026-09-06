import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api.js";

// Create container
export const createContainer = createAsyncThunk(
  "containers/createContainer",
  async (containerData, { rejectWithValue }) => {
    try {
      const response = await api.post("/containers", containerData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create container",
      );
    }
  },
);

// Get available containers
export const getContainers = createAsyncThunk(
  "containers/getContainers",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/containers", {
        params: filters,
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch containers",
      );
    }
  },
);

// Get provider's containers
export const getMyContainers = createAsyncThunk(
  "containers/getMyContainers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/containers/my");

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your containers",
      );
    }
  },
);

// Get provider's specific container
export const getMyContainerById = createAsyncThunk(
  "containers/getMyContainerById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/containers/my/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch container",
      );
    }
  },
);

// Get container by ID
export const getContainerById = createAsyncThunk(
  "containers/getContainerById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/containers/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch container",
      );
    }
  },
);

// Depart container
export const departContainer = createAsyncThunk(
  "containers/departContainer",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/containers/${id}/depart`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to depart container",
      );
    }
  },
);

// Deliver container
export const deliverContainer = createAsyncThunk(
  "containers/deliverContainer",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/containers/${id}/deliver`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to deliver container",
      );
    }
  },
);

// Update container location
export const updateContainerLocation = createAsyncThunk(
  "containers/updateContainerLocation",
  async ({ id, locationData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/containers/${id}/location`,
        locationData,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update container location",
      );
    }
  },
);

const initialState = {
  containers: [],
  currentContainer: null,
  loading: false,
  error: null,
};

const containerSlice = createSlice({
  name: "containers",

  initialState,

  reducers: {
    clearContainerError: (state) => {
      state.error = null;
    },

    clearCurrentContainer: (state) => {
      state.currentContainer = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // Create container
      .addCase(createContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.containers.push(action.payload.container);
        state.error = null;
      })

      .addCase(createContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get available containers
      .addCase(getContainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getContainers.fulfilled, (state, action) => {
        state.loading = false;
        state.containers = action.payload.containers;
        state.error = null;
      })

      .addCase(getContainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get my containers
      .addCase(getMyContainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getMyContainers.fulfilled, (state, action) => {
        state.loading = false;
        state.containers = action.payload.containers;
        state.error = null;
      })

      .addCase(getMyContainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get my container by ID
      .addCase(getMyContainerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getMyContainerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContainer = action.payload.container;
        state.error = null;
      })

      .addCase(getMyContainerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get container by ID
      .addCase(getContainerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getContainerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContainer = action.payload.container;
        state.error = null;
      })

      .addCase(getContainerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Depart container
      .addCase(departContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(departContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContainer = action.payload.container;
        state.error = null;
      })

      .addCase(departContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Deliver container
      .addCase(deliverContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deliverContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContainer = action.payload.container;
        state.error = null;
      })

      .addCase(deliverContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update location
      .addCase(updateContainerLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateContainerLocation.fulfilled, (state, action) => {
        state.loading = false;

        if (state.currentContainer) {
          state.currentContainer.currentLocation =
            action.payload.currentLocation;
        }

        state.error = null;
      })

      .addCase(updateContainerLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearContainerError, clearCurrentContainer } =
  containerSlice.actions;

export default containerSlice.reducer;
