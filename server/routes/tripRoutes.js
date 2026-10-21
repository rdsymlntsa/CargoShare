import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createTrip,
  getMyTrips,
  getOpenTrips,
  cancelTrip,
} from "../controllers/tripController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTrip);
router.get("/mine", getMyTrips);
router.get("/open", getOpenTrips);
router.patch("/:id/cancel", cancelTrip);

export default router;
