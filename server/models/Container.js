import mongoose from "mongoose";

const trackingPointSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true
    },

    longitude: {
      type: Number,
      required: true
    },

    locationName: {
      type: String,
      trim: true
    },

    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const containerSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    containerNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },

    origin: {
      type: String,
      required: true,
      trim: true
    },

    destination: {
      type: String,
      required: true,
      trim: true
    },

    departureDate: {
      type: Date,
      required: true
    },

    arrivalDate: {
      type: Date
    },

    totalWeightCapacity: {
      type: Number,
      required: true,
      min: 1
    },

    availableWeightCapacity: {
      type: Number,
      required: true,
      min: 0
    },

    totalVolumeCapacity: {
      type: Number,
      required: true,
      min: 0
    },

    availableVolumeCapacity: {
      type: Number,
      required: true,
      min: 0
    },

    pricePerKg: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "available",
        "full",
        "in-transit",
        "delivered",
        "cancelled"
      ],
      default: "available"
    },

    currentLocation: {
      latitude: {
        type: Number
      },

      longitude: {
        type: Number
      },

      locationName: {
        type: String,
        trim: true
      },

      updatedAt: {
        type: Date,
        default: Date.now
      }
    },

    trackingHistory: {
      type: [trackingPointSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Container = mongoose.model("Container", containerSchema);

export default Container;