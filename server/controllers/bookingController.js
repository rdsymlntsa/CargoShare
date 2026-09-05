import Booking from "../models/Booking.js";
import Container from "../models/Container.js";

export const createBooking = async (req, res) => {
  try {
    const { containerId, requestedWeight, requestedVolume } = req.body;

    if (
      !containerId ||
      requestedWeight === undefined ||
      requestedVolume === undefined
    ) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    if (requestedWeight <= 0 || requestedVolume < 0) {
      return res.status(400).json({
        message: "Invalid requested capacity",
      });
    }

    const container = await Container.findById(containerId);

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    if (container.status !== "available") {
      return res.status(400).json({
        message: "Container is not available for booking",
      });
    }

    if (requestedWeight > container.availableWeightCapacity) {
      return res.status(400).json({
        message: "Requested weight exceeds available capacity",
      });
    }

    if (requestedVolume > container.availableVolumeCapacity) {
      return res.status(400).json({
        message: "Requested volume exceeds available capacity",
      });
    }

    const booking = await Booking.create({
      exporter: req.user._id,
      container: containerId,
      requestedWeight,
      requestedVolume,
    });

    res.status(201).json({
      message: "Booking request created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      exporter: req.user._id,
    })
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

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      exporter: req.user._id,
    }).populate("container");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking fetched successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be approved",
      });
    }

    const container = await Container.findById(booking.container);

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    if (container.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to approve this booking",
      });
    }

    if (booking.requestedWeight > container.availableWeightCapacity) {
      return res.status(400).json({
        message: "Insufficient weight capacity",
      });
    }

    if (booking.requestedVolume > container.availableVolumeCapacity) {
      return res.status(400).json({
        message: "Insufficient volume capacity",
      });
    }

    container.availableWeightCapacity -= booking.requestedWeight;
    container.availableVolumeCapacity -= booking.requestedVolume;

    if (
      container.availableWeightCapacity === 0 ||
      container.availableVolumeCapacity === 0
    ) {
      container.status = "full";
    }

    booking.status = "approved";

    await container.save();
    await booking.save();

    res.status(200).json({
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getProviderBookings = async (req, res) => {
  try {
    const containers = await Container.find({
      provider: req.user._id,
    }).select("_id");

    const containerIds = containers.map((container) => container._id);

    const bookings = await Booking.find({
      container: { $in: containerIds },
      status: "pending",
    })
      .populate("exporter", "name email phone")
      .populate("container")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Booking requests fetched successfully",
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be rejected",
      });
    }

    const container = await Container.findById(booking.container);

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    if (container.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to reject this booking",
      });
    }

    booking.status = "rejected";

    await booking.save();

    res.status(200).json({
      message: "Booking rejected successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      exporter: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status !== "pending" && booking.status !== "approved") {
      return res.status(400).json({
        message: "This booking cannot be cancelled",
      });
    }

    const container = await Container.findById(booking.container);

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    if (
      booking.status === "approved" &&
      (container.status === "in-transit" || container.status === "delivered")
    ) {
      return res.status(400).json({
        message: "Approved booking cannot be cancelled after departure",
      });
    }

    if (booking.status === "approved") {
      container.availableWeightCapacity += booking.requestedWeight;
      container.availableVolumeCapacity += booking.requestedVolume;

      if (container.status === "full") {
        container.status = "available";
      }

      await container.save();
    }

    booking.status = "cancelled";

    await booking.save();

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
