import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import containerReducer from "../features/containers/containerSlice.js";
import bookingReducer from "../features/bookings/bookingSlice.js";
import messageReducer from "../features/messages/messageSlice.js";
import imageDetectionReducer from "../features/imageDetection/imageDetectionSlice.js";
import tripReducer from "../features/trips/tripSlice.js";
import pickupJobReducer from "../features/pickupJobs/pickupJobSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    containers: containerReducer,
    bookings: bookingReducer,
    messages: messageReducer,
    imageDetection: imageDetectionReducer,
    trips: tripReducer,
    pickupJobs: pickupJobReducer,
  },
});
