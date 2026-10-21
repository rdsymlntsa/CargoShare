import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
        validate: {
          validator(value) {
            return (
              value === undefined ||
              (value.length === 2 &&
                value[0] >= -180 &&
                value[0] <= 180 &&
                value[1] >= -90 &&
                value[1] <= 90)
            );
          },
          message: "Coordinates must be [longitude, latitude].",
        },
      },
    },
  },
  { _id: false },
);

const tripSchema = new mongoose.Schema(
  {
    traveller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    origin: {
      type: locationSchema,
      required: true,
    },

    destination: {
      type: locationSchema,
      required: true,
    },

    departureTime: {
      type: Date,
      required: true,
      index: true,
    },

    spareCapacityWeightKg: {
      type: Number,
      required: true,
      min: 0.1,
    },

    spareCapacityVolumeM3: {
      type: Number,
      required: true,
      min: 0.001,
    },

    maxDetourKm: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 2,
    },

    maxDetourMinutes: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
      default: 5,
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "cancelled"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true },
);

tripSchema.index({
  "origin.coordinates": "2dsphere",
  "destination.coordinates": "2dsphere",
});

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
