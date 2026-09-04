import mongoose from "mongoose";

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
    }
  },
  {
    timestamps: true
  }
);

const Container = mongoose.model("Container", containerSchema);

export default Container;