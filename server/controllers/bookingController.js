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
