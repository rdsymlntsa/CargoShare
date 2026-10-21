import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import containerReducer from "../features/containers/containerSlice.js";
import bookingReducer from "../features/bookings/bookingSlice.js";
import messageReducer from "../features/messages/messageSlice.js";
import imageDetectionReducer from "../features/imageDetection/imageDetectionSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    containers: containerReducer,
    bookings: bookingReducer,
    messages: messageReducer,
    imageDetection: imageDetectionReducer,
  },
});
