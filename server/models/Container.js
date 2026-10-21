import mongoose from "mongoose";

const routeStopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    expectedArrival: {
      type: Date,
      default: null,
    },

    expectedDeparture: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const segmentSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      trim: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
    },

    totalWeightCapacity: {
      type: Number,
      required: true,
      min: 1,
    },

    availableWeightCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    totalVolumeCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    availableVolumeCapacity: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const containerSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    containerNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    origin: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional estimated departure time from the origin.
    originDepartureTime: {
      type: Date,
      default: null,
    },

    // Optional estimated arrival time at the final destination.
    destinationArrivalTime: {
      type: Date,
      default: null,
    },

    // Each intermediate stop can have its own optional schedule.
    intermediateStops: {
      type: [routeStopSchema],
      default: [],
    },

    // Capacity available on each consecutive route segment.
    segments: {
      type: [segmentSchema],
      default: [],
    },

    departureDate: {
      type: Date,
      required: true,
    },

    arrivalDate: {
      type: Date,
    },

    totalWeightCapacity: {
      type: Number,
      required: true,
      min: 1,
    },

    availableWeightCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    totalVolumeCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    availableVolumeCapacity: {
      type: Number,
      required: true,
      min: 0,
    },

    pricePerKg: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["available", "full", "in-transit", "delivered", "cancelled"],
      default: "available",
    },

    currentLocation: {
      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },

      locationName: {
        type: String,
        trim: true,
      },

      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Container = mongoose.model("Container", containerSchema);

export default Container;
