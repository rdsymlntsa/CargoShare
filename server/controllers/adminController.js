import User from "../models/User.js";
import Container from "../models/Container.js";
import Booking from "../models/Booking.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllContainers = async (req, res) => {
  try {
    const containers = await Container.find()
      .populate("provider", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Containers fetched successfully",
      containers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("exporter", "name email phone")
      .populate("container")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
