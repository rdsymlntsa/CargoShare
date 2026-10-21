import Booking from "../models/Booking.js";
import Container from "../models/Container.js";

const getRouteStops = (container) => {
  const intermediateStops = (container.intermediateStops || []).map((stop) =>
    typeof stop === "string" ? stop : stop?.name,
  );

  return [container.origin, ...intermediateStops, container.destination];
};

const getCoveredSegmentIndexes = (container, pickup, dropoff) => {
  const route = getRouteStops(container);

  const normalize = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

  const pickupIndex = route.findIndex(
    (stop) => normalize(stop) === normalize(pickup),
  );

  const dropoffIndex = route.findIndex(
    (stop) => normalize(stop) === normalize(dropoff),
  );

  if (
    pickupIndex === -1 ||
    dropoffIndex === -1 ||
    pickupIndex >= dropoffIndex
  ) {
    return null;
  }

  const segments = container.segments || [];

  if (segments.length !== route.length - 1) {
    return null;
  }

  const indexes = [];

  for (let i = pickupIndex; i < dropoffIndex; i++) {
    const segment = segments[i];

    if (
      !segment ||
      normalize(segment.from) !== normalize(route[i]) ||
      normalize(segment.to) !== normalize(route[i + 1])
    ) {
      return null;
    }

    indexes.push(i);
  }

  return indexes;
};

const hasEnoughSegmentCapacity = (
  container,
  indexes,
  requestedWeight,
  requestedVolume,
) => {
  return indexes.every((index) => {
    const segment = container.segments[index];

    return (
      segment.availableWeightCapacity >= requestedWeight &&
      segment.availableVolumeCapacity >= requestedVolume
    );
  });
};

const updateContainerAvailabilityStatus = (container) => {
  const segments = container.segments || [];

  const hasAvailableCapacity = segments.some(
    (segment) =>
      segment.availableWeightCapacity > 0 &&
      segment.availableVolumeCapacity >= 0,
  );

  container.status = hasAvailableCapacity ? "available" : "full";
};

export const createBooking = async (req, res) => {
  try {
    const { containerId, pickup, dropoff, requestedWeight, requestedVolume } =
      req.body;

    if (
      !containerId ||
      typeof pickup !== "string" ||
      !pickup.trim() ||
      typeof dropoff !== "string" ||
      !dropoff.trim() ||
      requestedWeight === undefined ||
      requestedVolume === undefined
    ) {
      return res.status(400).json({
        message: "Container, pickup, dropoff, weight and volume are required",
      });
    }

    const weight = Number(requestedWeight);
    const volume = Number(requestedVolume);

    if (
      !Number.isFinite(weight) ||
      !Number.isFinite(volume) ||
      weight <= 0 ||
      volume < 0
    ) {
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

    if (!["available", "full"].includes(container.status)) {
      return res.status(400).json({
        message: "Container is not available for booking",
      });
    }

    const indexes = getCoveredSegmentIndexes(container, pickup, dropoff);

    if (!indexes) {
      return res.status(400).json({
        message: "Invalid route or segment capacity data",
      });
    }

    if (!hasEnoughSegmentCapacity(container, indexes, weight, volume)) {
      return res.status(400).json({
        message: "Insufficient capacity on one or more route segments",
      });
    }

    const booking = await Booking.create({
      exporter: req.user._id,
      container: container._id,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      requestedWeight: weight,
      requestedVolume: volume,
    });

    return res.status(201).json({
      message: "Booking request created successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
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

    return res.status(200).json({
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    let booking;

    if (req.user.role === "exporter") {
      booking = await Booking.findOne({
        _id: req.params.id,
        exporter: req.user._id,
      })
        .populate("container")
        .populate("exporter", "name email phone");
    } else if (req.user.role === "provider") {
      const containers = await Container.find({
        provider: req.user._id,
      }).select("_id");

      const containerIds = containers.map((container) => container._id);

      booking = await Booking.findOne({
        _id: req.params.id,
        container: { $in: containerIds },
      })
        .populate("container")
        .populate("exporter", "name email phone");
    }

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      message: "Booking fetched successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
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

    if (!["available", "full"].includes(container.status)) {
      return res.status(400).json({
        message: "Container is not available for booking",
      });
    }

    const indexes = getCoveredSegmentIndexes(
      container,
      booking.pickup,
      booking.dropoff,
    );

    if (!indexes) {
      return res.status(400).json({
        message: "Invalid route or segment capacity data",
      });
    }

    if (
      !hasEnoughSegmentCapacity(
        container,
        indexes,
        booking.requestedWeight,
        booking.requestedVolume,
      )
    ) {
      return res.status(400).json({
        message: "Insufficient capacity on one or more route segments",
      });
    }

    for (const index of indexes) {
      container.segments[index].availableWeightCapacity -=
        booking.requestedWeight;

      container.segments[index].availableVolumeCapacity -=
        booking.requestedVolume;
    }

    updateContainerAvailabilityStatus(container);

    booking.status = "approved";

    await container.save();
    await booking.save();

    return res.status(200).json({
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
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

    return res.status(200).json({
      message: "Booking requests fetched successfully",
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
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

    return res.status(200).json({
      message: "Booking rejected successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
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

    if (!["pending", "approved"].includes(booking.status)) {
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
      ["in-transit", "delivered"].includes(container.status)
    ) {
      return res.status(400).json({
        message: "Approved booking cannot be cancelled after departure",
      });
    }

    if (booking.status === "approved") {
      const indexes = getCoveredSegmentIndexes(
        container,
        booking.pickup,
        booking.dropoff,
      );

      if (!indexes) {
        return res.status(400).json({
          message: "Cannot restore capacity: invalid route or segment data",
        });
      }

      for (const index of indexes) {
        const segment = container.segments[index];

        segment.availableWeightCapacity = Math.min(
          segment.availableWeightCapacity + booking.requestedWeight,
          segment.totalWeightCapacity,
        );

        segment.availableVolumeCapacity = Math.min(
          segment.availableVolumeCapacity + booking.requestedVolume,
          segment.totalVolumeCapacity,
        );
      }

      updateContainerAvailabilityStatus(container);

      await container.save();
    }

    booking.status = "cancelled";

    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getProviderBookingHistory = async (req, res) => {
  try {
    const containers = await Container.find({
      provider: req.user._id,
    }).select("_id");

    const containerIds = containers.map((container) => container._id);

    const bookings = await Booking.find({
      container: { $in: containerIds },
      status: { $in: ["approved", "rejected", "cancelled"] },
    })
      .populate("exporter", "name email phone")
      .populate("container")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Booking history fetched successfully",
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
