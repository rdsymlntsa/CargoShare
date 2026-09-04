import Container from "../models/Container.js";
import Booking from "../models/Booking.js";

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

export const getContainers = async (req, res) => {
  try {
    const { origin, destination, departureDate, minWeight, minVolume } =
      req.query;

    const filter = {
      status: "available",
    };

    if (origin) {
      filter.origin = { $regex: origin, $options: "i" };
    }

    if (destination) {
      filter.destination = { $regex: destination, $options: "i" };
    }

    if (departureDate) {
      const startDate = new Date(departureDate);
      const endDate = new Date(departureDate);

      endDate.setDate(endDate.getDate() + 1);

      filter.departureDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    if (minWeight) {
      filter.availableWeightCapacity = {
        $gte: Number(minWeight),
      };
    }

    if (minVolume) {
      filter.availableVolumeCapacity = {
        $gte: Number(minVolume),
      };
    }

    const containers = await Container.find(filter)
      .populate("provider", "name email phone")
      .sort({ departureDate: 1 });

    res.json({
      count: containers.length,
      containers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const departContainer = async (req, res) => {
  try {
    const container = await Container.findById(req.params.id);

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    if (container.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to depart this container",
      });
    }

    if (container.status !== "available" && container.status !== "full") {
      return res.status(400).json({
        message: "Container cannot depart in its current status",
      });
    }

    container.status = "in-transit";

    await container.save();

    res.status(200).json({
      message: "Container is now in transit",
      container,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const deliverContainer = async (req, res) => {
  try {
    const container = await Container.findById(req.params.id);

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    if (container.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to deliver this container",
      });
    }

    if (container.status !== "in-transit") {
      return res.status(400).json({
        message: "Only containers in transit can be delivered",
      });
    }

    container.status = "delivered";

    await container.save();

    res.status(200).json({
      message: "Container delivered successfully",
      container,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateContainerLocation = async (req, res) => {
  try {
    const { latitude, longitude, locationName } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        message: "Latitude and longitude must be numbers",
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        message: "Invalid latitude",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        message: "Invalid longitude",
      });
    }

    const container = await Container.findById(req.params.id);

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    if (container.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this container",
      });
    }

    if (container.status !== "in-transit") {
      return res.status(400).json({
        message: "Location can only be updated while container is in transit",
      });
    }

    const trackingPoint = {
      latitude,
      longitude,
      locationName,
      timestamp: new Date(),
    };

    container.currentLocation = {
      latitude,
      longitude,
      locationName,
      updatedAt: trackingPoint.timestamp,
    };

    container.trackingHistory.push(trackingPoint);

    await container.save();

    res.status(200).json({
      message: "Container location updated successfully",
      currentLocation: container.currentLocation,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getContainerTracking = async (req, res) => {
  try {
    const container = await Container.findById(req.params.id);

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    const userId = req.user._id.toString();

    // Provider who owns the container
    if (
      req.user.role === "provider" &&
      container.provider.toString() === userId
    ) {
      return res.status(200).json({
        message: "Container tracking fetched successfully",
        container: {
          _id: container._id,
          containerNumber: container.containerNumber,
          origin: container.origin,
          destination: container.destination,
          status: container.status,
          currentLocation: container.currentLocation,
          trackingHistory: container.trackingHistory,
        },
      });
    }

    // Exporter who has a booking for the container
    if (req.user.role === "exporter") {
      const booking = await Booking.findOne({
        container: container._id,
        exporter: req.user._id,
      });

      if (!booking) {
        return res.status(403).json({
          message: "You are not authorized to view this container tracking",
        });
      }

      return res.status(200).json({
        message: "Container tracking fetched successfully",
        container: {
          _id: container._id,
          containerNumber: container.containerNumber,
          origin: container.origin,
          destination: container.destination,
          status: container.status,
          currentLocation: container.currentLocation,
          trackingHistory: container.trackingHistory,
        },
      });
    }

    // Admin
    if (req.user.role === "admin") {
      return res.status(200).json({
        message: "Container tracking fetched successfully",
        container: {
          _id: container._id,
          containerNumber: container.containerNumber,
          origin: container.origin,
          destination: container.destination,
          status: container.status,
          currentLocation: container.currentLocation,
          trackingHistory: container.trackingHistory,
        },
      });
    }

    return res.status(403).json({
      message: "You are not authorized to view this container tracking",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
