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
      !containerNumber ||
      !origin ||
      !destination ||
      !departureDate ||
      !arrivalDate ||
      totalWeightCapacity === undefined ||
      availableWeightCapacity === undefined ||
      totalVolumeCapacity === undefined ||
      availableVolumeCapacity === undefined ||
      pricePerKg === undefined
    ) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    // Convert values to numbers
    const totalWeight = Number(totalWeightCapacity);
    const availableWeight = Number(availableWeightCapacity);
    const totalVolume = Number(totalVolumeCapacity);
    const availableVolume = Number(availableVolumeCapacity);
    const price = Number(pricePerKg);

    // Validate numeric values
    if (
      !Number.isFinite(totalWeight) ||
      !Number.isFinite(availableWeight) ||
      !Number.isFinite(totalVolume) ||
      !Number.isFinite(availableVolume) ||
      !Number.isFinite(price)
    ) {
      return res.status(400).json({
        message: "Capacity and price values must be valid numbers",
      });
    }

    // Validate weight capacity
    if (totalWeight <= 0 || availableWeight <= 0) {
      return res.status(400).json({
        message: "Weight capacity must be greater than 0",
      });
    }

    if (availableWeight > totalWeight) {
      return res.status(400).json({
        message: "Available weight capacity cannot exceed total capacity",
      });
    }

    // Validate volume capacity
    if (totalVolume <= 0 || availableVolume <= 0) {
      return res.status(400).json({
        message: "Volume capacity must be greater than 0",
      });
    }

    if (availableVolume > totalVolume) {
      return res.status(400).json({
        message: "Available volume capacity cannot exceed total capacity",
      });
    }

    // Validate price
    if (price <= 0) {
      return res.status(400).json({
        message: "Price per kg must be greater than 0",
      });
    }

    // Validate dates
    const departure = new Date(departureDate);
    const arrival = new Date(arrivalDate);

    if (Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime())) {
      return res.status(400).json({
        message: "Invalid departure or arrival date",
      });
    }

    if (arrival <= departure) {
      return res.status(400).json({
        message: "Arrival date must be after departure date",
      });
    }

    // Check for duplicate container number
    const existingContainer = await Container.findOne({
      containerNumber,
    });

    if (existingContainer) {
      return res.status(400).json({
        message: "Container number already exists",
      });
    }

    // Create container
    const container = await Container.create({
      provider: req.user._id,
      containerNumber,
      origin,
      destination,
      departureDate: departure,
      arrivalDate: arrival,
      totalWeightCapacity: totalWeight,
      availableWeightCapacity: availableWeight,
      totalVolumeCapacity: totalVolume,
      availableVolumeCapacity: availableVolume,
      pricePerKg: price,
    });

    return res.status(201).json({
      message: "Container listed successfully",
      container,
    });
  } catch (error) {
    // Safety net for MongoDB unique index
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Container number already exists",
      });
    }

    return res.status(500).json({
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
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        message: "Latitude and longitude must be valid numbers",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        message: "Latitude must be between -90 and 90",
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        message: "Longitude must be between -180 and 180",
      });
    }

    const container = await Container.findById(id);

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
        message: "Location can only be updated for in-transit containers",
      });
    }

    const now = new Date();

    // Update current location every time
    container.currentLocation = {
      latitude: lat,
      longitude: lng,
      updatedAt: now,
    };

    // Save to tracking history only every 5 minutes
    const lastHistoryPoint =
      container.trackingHistory.length > 0
        ? container.trackingHistory[container.trackingHistory.length - 1]
        : null;

    const shouldSaveHistory =
      !lastHistoryPoint ||
      now.getTime() - new Date(lastHistoryPoint.timestamp).getTime() >=
        5 * 60 * 1000;

    if (shouldSaveHistory) {
      container.trackingHistory.push({
        latitude: lat,
        longitude: lng,
        timestamp: now,
      });
    }

    await container.save();

    return res.status(200).json({
      message: "Container location updated successfully",
      container,
    });
  } catch (error) {
    return res.status(500).json({
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

export const getMyContainers = async (req, res) => {
  try {
    const containers = await Container.find({
      provider: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your containers fetched successfully",
      containers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getContainerById = async (req, res) => {
  try {
    const container = await Container.findById(req.params.id).populate(
      "provider",
      "name email phone",
    );

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    res.status(200).json({
      message: "Container fetched successfully",
      container,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getMyContainerById = async (req, res) => {
  try {
    const container = await Container.findOne({
      _id: req.params.id,
      provider: req.user._id,
    });

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    res.status(200).json({
      message: "Container fetched successfully",
      container,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
