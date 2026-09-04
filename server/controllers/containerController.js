import Container from "../models/Container.js";

export const createContainer = async (req, res) => {
  try {
    const {
      containerNumber,
      origin,
      destination,
      departureDate,
      arrivalDate,
      totalWeightCapacity,
      availableWeightCapacity,
      totalVolumeCapacity,
      availableVolumeCapacity,
      pricePerKg,
    } = req.body;

    // Check required fields
    if (
      !origin ||
      !destination ||
      !departureDate ||
      !totalWeightCapacity ||
      availableWeightCapacity === undefined ||
      totalVolumeCapacity === undefined ||
      availableVolumeCapacity === undefined ||
      pricePerKg === undefined
    ) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    // Validate capacity
    if (availableWeightCapacity > totalWeightCapacity) {
      return res.status(400).json({
        message: "Available weight capacity cannot exceed total capacity",
      });
    }

    if (availableVolumeCapacity > totalVolumeCapacity) {
      return res.status(400).json({
        message: "Available volume capacity cannot exceed total capacity",
      });
    }

    // Create container
    const container = await Container.create({
      provider: req.user._id,
      containerNumber,
      origin,
      destination,
      departureDate,
      arrivalDate,
      totalWeightCapacity,
      availableWeightCapacity,
      totalVolumeCapacity,
      availableVolumeCapacity,
      pricePerKg,
    });

    res.status(201).json({
      message: "Container listed successfully",
      container,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
