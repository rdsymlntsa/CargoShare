import express from "express";

import {
  getAllUsers,
  getAllContainers,
  getAllBookings,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/users", authMiddleware, roleMiddleware(["admin"]), getAllUsers);

router.get(
  "/containers",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllContainers,
);

router.get(
  "/bookings",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllBookings,
);

export default router;
