import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMessages,
  sendMessage,
  addMessage,
  clearMessages,
} from "../features/messages/messageSlice.js";

import socket from "../socket.js";

const Chat = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const { messages, loading, sending, error } = useSelector(
    (state) => state.messages,
  );

  const [messageText, setMessageText] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(clearMessages());
    dispatch(getMessages(bookingId));

    socket.connect();

    socket.emit("joinBooking", bookingId);

    const handleNewMessage = (newMessage) => {
      dispatch(addMessage(newMessage));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.disconnect();
      dispatch(clearMessages());
    };
  }, [bookingId, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || sending) {
      return;
    }

    const result = await dispatch(
      sendMessage({
        bookingId,
        message: trimmedMessage,
      }),
    );

    if (sendMessage.fulfilled.match(result)) {
      setMessageText("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-teal-700 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1
            onClick={() => navigate("/")}
            className="text-2xl font-bold cursor-pointer"
          >
            CargoShare
          </h1>

          <button
            onClick={() => navigate(-1)}
            className="bg-white text-teal-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
          >
            Go Back
          </button>
        </div>
      </nav>

      {/* Chat */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Booking Chat</h2>

            <p className="text-teal-100 text-sm mt-1">
              Communicate with the other party about this booking.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mt-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Messages */}
          <div className="h-125 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">
                  No messages yet. Start the conversation.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage =
                  message.sender?._id?.toString() === user?._id?.toString();

                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-lg ${
                        isOwnMessage
                          ? "bg-teal-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">
                        {message.sender?.name || "User"}
                      </p>

                      <p className="wrap-break-word">{message.message}</p>

                      <p
                        className={`text-xs mt-2 ${
                          isOwnMessage ? "text-teal-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t p-4 flex gap-3"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              maxLength={1000}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <button
              type="submit"
              disabled={!messageText.trim() || sending}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Chat;
