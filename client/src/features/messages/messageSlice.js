import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api.js"

export const getMessages = createAsyncThunk(
  "messages/getMessages",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/${bookingId}`);

      return response.data.messages;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load messages",
      );
    }
  },
);

export const sendMessage = createAsyncThunk(
  "messages/sendMessage",
  async ({ bookingId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post("/messages", {
        bookingId,
        message,
      });

      return response.data.chatMessage;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message",
      );
    }
  },
);

const initialState = {
  messages: [],
  loading: false,
  sending: false,
  error: null,
};

const messageSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },

    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.sending = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, clearMessages, clearError } = messageSlice.actions;

export default messageSlice.reducer;
