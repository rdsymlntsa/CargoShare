import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL =
  import.meta.env.VITE_YOLO_API_URL ||
  "https://yolo-api-r03g.onrender.com";

export const predictImage = createAsyncThunk(
  "imageDetection/predictImage",
  async (imageFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.detail || "Failed to process the image.");
      }

      return data;
    } catch {
      return rejectWithValue(
        "Could not connect to the YOLO API. Please try again.",
      );
    }
  },
);

const imageDetectionSlice = createSlice({
  name: "imageDetection",
  initialState: {
    result: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPrediction: (state) => {
      state.result = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(predictImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.result = null;
      })
      .addCase(predictImage.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(predictImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Image prediction failed.";
      });
  },
});

export const { clearPrediction } = imageDetectionSlice.actions;

export default imageDetectionSlice.reducer;
