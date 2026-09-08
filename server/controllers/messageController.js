import Message from "../models/Message.js";
import Booking from "../models/Booking.js";

export const sendMessage = async (req, res) => {
  try {
    const { bookingId, message } = req.body;

    if (!bookingId || !message) {
      return res.status(400).json({
        message: "Booking ID and message are required",
      });
    }

    const booking = await Booking.findById(bookingId).populate(
      "container",
      "provider",
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const exporterId = booking.exporter.toString();
    const providerId = booking.container.provider.toString();
    const userId = req.user._id.toString();

    if (userId !== exporterId && userId !== providerId) {
      return res.status(403).json({
        message: "You are not part of this booking",
      });
    }

    const receiver = userId === exporterId ? providerId : exporterId;

    const newMessage = await Message.create({
      booking: bookingId,
      sender: req.user._id,
      receiver,
      message: message.trim(),
    });

    const populatedMessage = await newMessage.populate("sender", "name role");

    res.status(201).json({
      message: "Message sent successfully",
      chatMessage: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate(
      "container",
      "provider",
    );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const exporterId = booking.exporter.toString();
    const providerId = booking.container.provider.toString();
    const userId = req.user._id.toString();

    if (userId !== exporterId && userId !== providerId) {
      return res.status(403).json({
        message: "You are not part of this booking",
      });
    }

    const messages = await Message.find({
      booking: bookingId,
    })
      .populate("sender", "name role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      messages,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
