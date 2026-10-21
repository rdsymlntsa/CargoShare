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

const pickupJobSchema = new mongoose.Schema(
  {
    exporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Optional link to an existing CargoShare booking.
    containerBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    pickupLocation: {
      type: locationSchema,
      required: true,
    },

    dropLocation: {
      type: locationSchema,
      required: true,
    },

    weightKg: {
      type: Number,
      required: true,
      min: 0.1,
    },

    lengthCm: {
      type: Number,
      required: true,
      min: 1,
    },

    widthCm: {
      type: Number,
      required: true,
      min: 1,
    },

    heightCm: {
      type: Number,
      required: true,
      min: 1,
    },

    pickupWindowStart: {
      type: Date,
      required: true,
      index: true,
    },

    pickupWindowEnd: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    assignedTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      default: null,
      index: true,
    },

    traveller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "accepted", "picked-up", "delivered", "cancelled"],
      default: "open",
      index: true,
    },

    pickupCodeHash: {
  type: String,
  default: null,
  select: false,
},

deliveryCodeHash: {
  type: String,
  default: null,
  select: false,
},

pickedUpAt: {
  type: Date,
  default: null,
},

deliveredAt: {
  type: Date,
  default: null,
},
  },
  { timestamps: true },
);

pickupJobSchema.index({
  "pickupLocation.coordinates": "2dsphere",
  status: 1,
});

pickupJobSchema.index({
  "dropLocation.coordinates": "2dsphere",
  status: 1,
});

const PickupJob = mongoose.model("PickupJob", pickupJobSchema);

export default PickupJob;
