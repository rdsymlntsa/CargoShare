import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api.js"
import socket from "../socket.js";

const Chat = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/${bookingId}`);

        setMessages(response.data.messages);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [bookingId]);

  useEffect(() => {
    socket.connect();

    socket.emit("joinBooking", bookingId);

    const handleNewMessage = (newMessage) => {
      setMessages((previousMessages) => [...previousMessages, newMessage]);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.disconnect();
    };
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) {
      return;
    }

    try {
      setError("");

      const response = await api.post("/messages", {
        bookingId,
        message: trimmedMessage,
      });

      setMessageText("");

      // The message will also arrive through Socket.IO.
      // We don't add it here to avoid displaying it twice.
      console.log(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-teal-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Booking Chat</h2>

            <p className="text-teal-100 text-sm mt-1">
              Communicate with the other party about this booking.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="h-125 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">
                  No messages yet. Start the conversation.
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage =
                  message.sender?._id === user?._id ||
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

                      <p>{message.message}</p>

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
              disabled={!messageText.trim()}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Chat;
