
import mongoose from "mongoose";
import {
  createHash,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

import PickupJob from "../models/PickupJob.js";
import Booking from "../models/Booking.js";
import Trip from "../models/Trip.js";
import { findTripMatch } from "../services/routeMatchingService.js";

// Generate a secure six-digit verification code.
const generateVerificationCode = () =>
  randomInt(100000, 1000000).toString();

// Store only the hash of each verification code.
const hashVerificationCode = (code) =>
  createHash("sha256").update(code).digest("hex");

// Verify a submitted code against its stored hash.
const verifyCode = (submittedCode, storedHash) => {
  if (
    typeof submittedCode !== "string" ||
    !/^\d{6}$/.test(submittedCode) ||
    !storedHash ||
    !/^[a-f0-9]{64}$/i.test(storedHash)
  ) {
    return false;
  }

  const submittedHash = hashVerificationCode(submittedCode);

  return timingSafeEqual(
    Buffer.from(submittedHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
};

// Remove sensitive hashes before returning job data.
const sanitizePickupJob = (job) => {
  const data = job.toObject();

  delete data.pickupCodeHash;
  delete data.deliveryCodeHash;

  return data;
};

// CREATE PICKUP JOB
export const createPickupJob = async (req, res) => {
  try {
    if (req.user.role !== "exporter") {
      return res.status(403).json({
        message: "Only exporters can create pickup jobs.",
      });
    }

    const {
      containerBooking,
      pickupLocation,
      dropLocation,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      pickupWindowStart,
      pickupWindowEnd,
      price,
    } = req.body;

    if (
      !pickupLocation?.name?.trim() ||
      !dropLocation?.name?.trim() ||
      weightKg == null ||
      lengthCm == null ||
      widthCm == null ||
      heightCm == null ||
      !pickupWindowStart ||
      !pickupWindowEnd ||
      price == null
    ) {
      return res.status(400).json({
        message: "Please provide all required pickup job details.",
      });
    }

    const start = new Date(pickupWindowStart);
    const end = new Date(pickupWindowEnd);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start <= new Date() ||
      end <= start
    ) {
      return res.status(400).json({
        message: "Provide a valid future pickup window.",
      });
    }

    const numericValues = [
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      price,
    ];

    if (
      numericValues.some(
        (value) =>
          typeof value !== "number" ||
          !Number.isFinite(value)
      ) ||
      weightKg <= 0 ||
      lengthCm <= 0 ||
      widthCm <= 0 ||
      heightCm <= 0 ||
      price < 0
    ) {
      return res.status(400).json({
        message: "Package dimensions, weight, and price must be valid numbers.",
      });
    }

    let bookingId = null;

    if (containerBooking) {
      if (!mongoose.isValidObjectId(containerBooking)) {
        return res.status(400).json({
          message: "Invalid container booking ID.",
        });
      }

      const booking = await Booking.findOne({
        _id: containerBooking,
        exporter: req.user._id,
      });

      if (!booking) {
        return res.status(404).json({
          message: "Your container booking was not found.",
        });
      }

      if (!["pending", "approved"].includes(booking.status)) {
        return res.status(400).json({
          message: "This container booking cannot be linked to a pickup job.",
        });
      }

      bookingId = booking._id;
    }

    const pickupCode = generateVerificationCode();
    const deliveryCode = generateVerificationCode();

    const pickupJob = await PickupJob.create({
      exporter: req.user._id,
      containerBooking: bookingId,
      pickupLocation,
      dropLocation,
      weightKg,
      lengthCm,
      widthCm,
      heightCm,
      pickupWindowStart: start,
      pickupWindowEnd: end,
      price,
      pickupCodeHash: hashVerificationCode(pickupCode),
      deliveryCodeHash: hashVerificationCode(deliveryCode),
    });

    return res.status(201).json({
      message: "Pickup job created successfully.",
      pickupJob: sanitizePickupJob(pickupJob),
      verificationCodes: {
        pickupCode,
        deliveryCode,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Create pickup job error:", error);

    return res.status(500).json({
      message: "Failed to create pickup job.",
    });
  }
};

// GET MY PICKUP JOBS
export const getMyPickupJobs = async (req, res) => {
  try {
    const pickupJobs = await PickupJob.find({
      exporter: req.user._id,
    })
      .populate("assignedTrip")
      .populate("traveller", "name phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      pickupJobs: pickupJobs.map(sanitizePickupJob),
    });
  } catch (error) {
    console.error("Get my pickup jobs error:", error);

    return res.status(500).json({
      message: "Failed to fetch your pickup jobs.",
    });
  }
};

// GET OPEN PICKUP JOBS
export const getOpenPickupJobs = async (req, res) => {
  try {
    const pickupJobs = await PickupJob.find({
      status: "open",
      pickupWindowEnd: { $gte: new Date() },
    })
      .populate("exporter", "name")
      .sort({ pickupWindowStart: 1 });

    return res.status(200).json({
      pickupJobs: pickupJobs.map(sanitizePickupJob),
    });
  } catch (error) {
    console.error("Get open pickup jobs error:", error);

    return res.status(500).json({
      message: "Failed to fetch available pickup jobs.",
    });
  }
};

// CANCEL PICKUP JOB
export const cancelPickupJob = async (req, res) => {
  try {
    const pickupJob = await PickupJob.findOne({
      _id: req.params.id,
      exporter: req.user._id,
    });

    if (!pickupJob) {
      return res.status(404).json({
        message: "Pickup job not found.",
      });
    }

    if (pickupJob.status !== "open") {
      return res.status(400).json({
        message: "Only open pickup jobs can be cancelled.",
      });
    }

    pickupJob.status = "cancelled";
    await pickupJob.save();

    return res.status(200).json({
      message: "Pickup job cancelled successfully.",
      pickupJob: sanitizePickupJob(pickupJob),
    });
  } catch (error) {
    console.error("Cancel pickup job error:", error);

    return res.status(500).json({
      message: "Failed to cancel pickup job.",
    });
  }
};

// FIND JOBS MATCHING A TRIP
export const getMatchedPickupJobs = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.tripId,
      traveller: req.user._id,
      status: "open",
      departureTime: { $gte: new Date() },
    });

    if (!trip) {
      return res.status(404).json({
        message: "Open trip not found.",
      });
    }

    const jobs = await PickupJob.find({
      status: "open",
      pickupWindowEnd: { $gte: new Date() },
      exporter: { $ne: req.user._id },
    })
      .populate("exporter", "name")
      .sort({ pickupWindowStart: 1 })
      .limit(50);

    const matches = [];

    for (const job of jobs) {
      try {
        const result = await findTripMatch(trip, job);

        if (result.matches) {
          matches.push({
            job: sanitizePickupJob(job),
            detourKm: result.detourKm,
            detourMinutes: result.detourMinutes,
            estimatedPickupTime: result.estimatedPickupTime,
            estimatedRouteDistanceKm:
              result.estimatedRouteDistanceKm,
          });
        }
      } catch (error) {
        console.error(
          `Matching failed for job ${job._id}:`,
          error.message
        );
      }
    }

    return res.status(200).json({
      tripId: trip._id,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("Match pickup jobs error:", error);

    return res.status(500).json({
      message: "Failed to find matching pickup jobs.",
    });
  }
};

// ACCEPT A PICKUP JOB
export const acceptPickupJob = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (req.user.role !== "exporter" && req.user.role !== "provider") {
      return res.status(403).json({
        message: "Your account cannot accept pickup jobs.",
      });
    }

    const { tripId } = req.body;

    if (!tripId || !mongoose.isValidObjectId(tripId)) {
      return res.status(400).json({
        message: "A valid tripId is required.",
      });
    }

    const trip = await Trip.findOne({
      _id: tripId,
      traveller: req.user._id,
      status: "open",
      departureTime: { $gte: new Date() },
    });

    if (!trip) {
      return res.status(404).json({
        message: "Your open trip was not found.",
      });
    }

    const job = await PickupJob.findOne({
      _id: req.params.id,
      status: "open",
      pickupWindowEnd: { $gte: new Date() },
      exporter: { $ne: req.user._id },
    });

    if (!job) {
      return res.status(404).json({
        message: "Pickup job is unavailable.",
      });
    }

    const match = await findTripMatch(trip, job);

    if (!match.matches) {
      return res.status(400).json({
        message: "This job does not match your trip.",
        reason: match.reason,
      });
    }

    const volumeM3 =
      (job.lengthCm * job.widthCm * job.heightCm) / 1_000_000;

    let acceptedJob;

    await session.withTransaction(async () => {
      const updatedTrip = await Trip.findOneAndUpdate(
        {
          _id: trip._id,
          traveller: req.user._id,
          status: "open",
          departureTime: { $gte: new Date() },
          spareCapacityWeightKg: { $gte: job.weightKg },
          spareCapacityVolumeM3: { $gte: volumeM3 },
        },
        {
          $inc: {
            spareCapacityWeightKg: -job.weightKg,
            spareCapacityVolumeM3: -volumeM3,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedTrip) {
        throw Object.assign(
          new Error("Insufficient remaining trip capacity."),
          { statusCode: 409 }
        );
      }

      const claimedJob = await PickupJob.findOneAndUpdate(
        {
          _id: job._id,
          status: "open",
          assignedTrip: null,
          pickupWindowEnd: { $gte: new Date() },
        },
        {
          $set: {
            status: "accepted",
            assignedTrip: trip._id,
            traveller: req.user._id,
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      if (!claimedJob) {
        throw Object.assign(
          new Error("Another traveller has already claimed this job."),
          { statusCode: 409 }
        );
      }

      acceptedJob = claimedJob;
    });

    return res.status(200).json({
      message: "Pickup job accepted successfully.",
      pickupJob: sanitizePickupJob(acceptedJob),
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }

    console.error("Accept pickup job error:", error);

    return res.status(500).json({
      message: "Failed to accept pickup job.",
    });
  } finally {
    await session.endSession();
  }
};

// CONFIRM PICKUP
export const verifyPickupCode = async (req, res) => {
  try {
    const job = await PickupJob.findOne({
      _id: req.params.id,
      traveller: req.user._id,
      status: "accepted",
    }).select("+pickupCodeHash");

    if (!job) {
      return res.status(404).json({
        message: "Accepted pickup job not found.",
      });
    }

    if (!verifyCode(req.body.code, job.pickupCodeHash)) {
      return res.status(400).json({
        message: "Invalid pickup verification code.",
      });
    }

    job.status = "picked-up";
    job.pickedUpAt = new Date();
    job.pickupCodeHash = null;

    await job.save();

    return res.status(200).json({
      message: "Pickup confirmed successfully.",
      pickupJob: {
        _id: job._id,
        status: job.status,
        pickedUpAt: job.pickedUpAt,
      },
    });
  } catch (error) {
    console.error("Verify pickup code error:", error);

    return res.status(500).json({
      message: "Failed to confirm pickup.",
    });
  }
};

// CONFIRM DELIVERY
export const verifyDeliveryCode = async (req, res) => {
  try {
    const job = await PickupJob.findOne({
      _id: req.params.id,
      traveller: req.user._id,
      status: "picked-up",
    }).select("+deliveryCodeHash");

    if (!job) {
      return res.status(404).json({
        message: "Picked-up job not found.",
      });
    }

    if (!verifyCode(req.body.code, job.deliveryCodeHash)) {
      return res.status(400).json({
        message: "Invalid delivery verification code.",
      });
    }

    job.status = "delivered";
    job.deliveredAt = new Date();
    job.deliveryCodeHash = null;

    await job.save();

    return res.status(200).json({
      message: "Delivery confirmed successfully.",
      pickupJob: {
        _id: job._id,
        status: job.status,
        deliveredAt: job.deliveredAt,
      },
    });
  } catch (error) {
    console.error("Verify delivery code error:", error);

    return res.status(500).json({
      message: "Failed to confirm delivery.",
    });
  }
};
