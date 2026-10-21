import Container from "../models/Container.js";
import Booking from "../models/Booking.js";

export const createContainer = async (req, res) => {
  try {
    const {
      containerNumber,
      origin,
      destination,
      intermediateStops = [],
      departureDate,
      arrivalDate,
      totalWeightCapacity,
      availableWeightCapacity,
      totalVolumeCapacity,
      availableVolumeCapacity,
      pricePerKg,
    } = req.body;

    if (
      typeof containerNumber !== "string" ||
      !containerNumber.trim() ||
      typeof origin !== "string" ||
      !origin.trim() ||
      typeof destination !== "string" ||
      !destination.trim() ||
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

    if (!Array.isArray(intermediateStops)) {
      return res.status(400).json({
        message: "Intermediate stops must be an array",
      });
    }

    const departure = new Date(departureDate);
    const arrival = new Date(arrivalDate);

    if (Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime())) {
      return res.status(400).json({
        message: "Invalid departure or arrival date",
      });
    }

    if (arrival <= departure) {
      return res.status(400).json({
        message: "Arrival must be after departure",
      });
    }

    const parseOptionalDate = (value, fieldName) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid ${fieldName}`);
      }

      if (date < departure || date > arrival) {
        throw new Error(`${fieldName} must fall within the journey schedule`);
      }

      return date;
    };

    const normalizedStops = [];
    let previousScheduledTime = departure;

    for (const stop of intermediateStops) {
      const stopName = typeof stop === "string" ? stop : stop?.name;

      if (typeof stopName !== "string" || !stopName.trim()) {
        return res.status(400).json({
          message: "Every intermediate stop must have a valid name",
        });
      }

      const expectedArrival = parseOptionalDate(
        typeof stop === "object" && stop !== null ? stop.expectedArrival : null,
        `Expected arrival time for ${stopName}`,
      );

      const expectedDeparture = parseOptionalDate(
        typeof stop === "object" && stop !== null
          ? stop.expectedDeparture
          : null,
        `Expected departure time for ${stopName}`,
      );

      if (
        expectedArrival &&
        expectedDeparture &&
        expectedDeparture < expectedArrival
      ) {
        return res.status(400).json({
          message: `Departure at ${stopName} cannot be before arrival`,
        });
      }

      if (expectedArrival && expectedArrival < previousScheduledTime) {
        return res.status(400).json({
          message: `Schedule at ${stopName} must follow the previous stop`,
        });
      }

      if (expectedArrival) {
        previousScheduledTime = expectedArrival;
      }

      if (expectedDeparture && expectedDeparture < previousScheduledTime) {
        return res.status(400).json({
          message: `Schedule at ${stopName} must follow the previous stop`,
        });
      }

      if (expectedDeparture) {
        previousScheduledTime = expectedDeparture;
      }

      normalizedStops.push({
        name: stopName.trim(),
        expectedArrival,
        expectedDeparture,
      });
    }

    const route = [
      origin.trim(),
      ...normalizedStops.map((stop) => stop.name),
      destination.trim(),
    ];

    const normalizedRoute = route.map((stop) => stop.toLowerCase());

    if (new Set(normalizedRoute).size !== normalizedRoute.length) {
      return res.status(400).json({
        message: "A location cannot appear more than once in the route",
      });
    }

    const totalWeight = Number(totalWeightCapacity);
    const availableWeight = Number(availableWeightCapacity);
    const totalVolume = Number(totalVolumeCapacity);
    const availableVolume = Number(availableVolumeCapacity);
    const price = Number(pricePerKg);

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

    if (
      totalWeight <= 0 ||
      availableWeight <= 0 ||
      availableWeight > totalWeight
    ) {
      return res.status(400).json({
        message: "Invalid weight capacity values",
      });
    }

    if (
      totalVolume <= 0 ||
      availableVolume <= 0 ||
      availableVolume > totalVolume
    ) {
      return res.status(400).json({
        message: "Invalid volume capacity values",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        message: "Price per kg must be greater than 0",
      });
    }

    const normalizedContainerNumber = containerNumber.trim();

    const existingContainer = await Container.findOne({
      containerNumber: normalizedContainerNumber,
    });

    if (existingContainer) {
      return res.status(400).json({
        message: "Container number already exists",
      });
    }

    const segments = [];

    for (let i = 0; i < route.length - 1; i++) {
      segments.push({
        from: route[i],
        to: route[i + 1],
        totalWeightCapacity: totalWeight,
        availableWeightCapacity: availableWeight,
        totalVolumeCapacity: totalVolume,
        availableVolumeCapacity: availableVolume,
      });
    }

    const container = await Container.create({
      provider: req.user._id,
      containerNumber: normalizedContainerNumber,
      origin: route[0],
      destination: route[route.length - 1],
      intermediateStops: normalizedStops,
      segments,
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
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Container number already exists",
      });
    }

    if (error.message?.startsWith("Invalid ")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.message?.includes("must fall within")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.message?.includes("Schedule at")) {
      return res.status(400).json({
        message: error.message,
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
    const {
      origin,
      destination,
      departureDate,
      minWeight,
      minVolume,
      maxPrice,
    } = req.query;

    const weight = minWeight === undefined ? 0 : Number(minWeight);
    const volume = minVolume === undefined ? 0 : Number(minVolume);
    const price = maxPrice === undefined ? Infinity : Number(maxPrice);

    if (
      !Number.isFinite(weight) ||
      weight < 0 ||
      !Number.isFinite(volume) ||
      volume < 0 ||
      (maxPrice !== undefined && (!Number.isFinite(price) || price < 0))
    ) {
      return res.status(400).json({
        message: "Invalid capacity or price filters",
      });
    }

    const filter = {
      status: { $in: ["available", "full"] },
    };

    if (departureDate) {
      const startDate = new Date(departureDate);

      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({
          message: "Invalid departure date",
        });
      }

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      filter.departureDate = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    if (maxPrice !== undefined) {
      filter.pricePerKg = { $lte: price };
    }

    const containers = await Container.find(filter)
      .populate("provider", "name email phone")
      .sort({ departureDate: 1 });

    const normalize = (value) =>
      String(value ?? "")
        .trim()
        .toLowerCase();

    const results = containers
      .map((container) => {
        const stops = (container.intermediateStops || []).map((stop) =>
          typeof stop === "string" ? stop : stop?.name,
        );

        const route = [container.origin, ...stops, container.destination];

        let segments = container.segments || [];

        // Reconstruct segments for legacy containers without valid segment counts.
        if (segments.length !== route.length - 1) {
          segments = Array.from({ length: route.length - 1 }, (_, index) => ({
            from: route[index],
            to: route[index + 1],
            totalWeightCapacity: container.totalWeightCapacity,
            availableWeightCapacity: container.availableWeightCapacity,
            totalVolumeCapacity: container.totalVolumeCapacity,
            availableVolumeCapacity: container.availableVolumeCapacity,
          }));
        }

        const possibleRoutes = [];

        for (let i = 0; i < route.length - 1; i++) {
          if (origin && normalize(route[i]) !== normalize(origin)) {
            continue;
          }

          for (let j = i + 1; j < route.length; j++) {
            if (destination && normalize(route[j]) !== normalize(destination)) {
              continue;
            }

            const coveredSegments = segments.slice(i, j);

            if (coveredSegments.length !== j - i) {
              continue;
            }

            const hasCapacity = coveredSegments.every(
              (segment) =>
                Number(segment.availableWeightCapacity) >= weight &&
                Number(segment.availableVolumeCapacity) >= volume,
            );

            if (hasCapacity) {
              possibleRoutes.push({
                pickup: route[i],
                dropoff: route[j],
                startIndex: i,
                endIndex: j,
              });
            }
          }
        }

        // Exclude containers that don't match the requested route or capacity.
        if (possibleRoutes.length === 0) {
          return null;
        }

        // Return one result per container, with all valid route options.
        return {
          ...container.toObject(),
          matchingRoutes: possibleRoutes,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      count: results.length,
      containers: results,
    });
  } catch (error) {
    return res.status(500).json({
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

    container.currentLocation = {
      latitude: lat,
      longitude: lng,
      updatedAt: new Date(),
    };

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

export const getContainerLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const container = await Container.findById(id).select(
      "provider containerNumber origin destination status currentLocation",
    );

    if (!container) {
      return res.status(404).json({
        message: "Container not found",
      });
    }

    const isProvider =
      container.provider.toString() === req.user._id.toString();

    if (!isProvider) {
      const booking = await Booking.findOne({
        container: id,
        exporter: req.user._id,
        status: "approved",
      });

      if (!booking) {
        return res.status(403).json({
          message: "You are not authorized to track this container",
        });
      }
    }

    if (container.status !== "in-transit") {
      return res.status(400).json({
        message: "Container is not currently in transit",
      });
    }

    return res.status(200).json({
      message: "Container location fetched successfully",
      container,
    });
  } catch (error) {
    return res.status(500).json({
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
