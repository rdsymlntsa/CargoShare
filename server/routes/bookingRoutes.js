import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  approveBooking,
} from "../controllers/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["exporter"]), createBooking);
router.get("/", authMiddleware, roleMiddleware(["exporter"]), getMyBookings);
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["exporter"]),
  getBookingById,
);
router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["provider"]),
  approveBooking,
);

export default router;
