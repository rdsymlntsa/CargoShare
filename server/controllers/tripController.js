import Trip from "../models/Trip.js";

export const createTrip = async (req, res) => {
  try {
    const {
      origin,
      destination,
      departureTime,
      spareCapacityWeightKg,
      spareCapacityVolumeM3,
      maxDetourKm,
      maxDetourMinutes,
    } = req.body;

    if (
      !origin?.name ||
      !destination?.name ||
      !departureTime ||
      spareCapacityWeightKg == null ||
      spareCapacityVolumeM3 == null
    ) {
      return res.status(400).json({
        message: "Please provide all required trip details.",
      });
    }

    const departure = new Date(departureTime);

    if (Number.isNaN(departure.getTime()) || departure <= new Date()) {
      return res.status(400).json({
        message: "Departure time must be in the future.",
      });
    }

    const trip = await Trip.create({
      traveller: req.user._id,
      origin,
      destination,
      departureTime: departure,
      spareCapacityWeightKg,
      spareCapacityVolumeM3,
      maxDetourKm: maxDetourKm ?? 2,
      maxDetourMinutes: maxDetourMinutes ?? 5,
    });

    return res.status(201).json({
      message: "Trip created successfully.",
      trip,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Create trip error:", error);

    return res.status(500).json({
      message: "Failed to create trip.",
    });
  }
};

export const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      traveller: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ trips });
  } catch (error) {
    console.error("Get my trips error:", error);

    return res.status(500).json({
      message: "Failed to fetch your trips.",
    });
  }
};

export const getOpenTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      status: "open",
      departureTime: { $gte: new Date() },
    })
      .populate("traveller", "name")
      .sort({ departureTime: 1 });

    return res.status(200).json({ trips });
  } catch (error) {
    console.error("Get open trips error:", error);

    return res.status(500).json({
      message: "Failed to fetch available trips.",
    });
  }
};

export const cancelTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      traveller: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found.",
      });
    }

    if (trip.status !== "open") {
      return res.status(400).json({
        message: "Only open trips can be cancelled.",
      });
    }

    trip.status = "cancelled";
    await trip.save();

    return res.status(200).json({
      message: "Trip cancelled successfully.",
      trip,
    });
  } catch (error) {
    console.error("Cancel trip error:", error);

    return res.status(500).json({
      message: "Failed to cancel trip.",
    });
  }
};
