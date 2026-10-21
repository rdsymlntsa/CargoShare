import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createPickupJob,
  getMyPickupJobs,
  getOpenPickupJobs,
  cancelPickupJob,
  getMatchedPickupJobs,
  acceptPickupJob,
  verifyPickupCode,
  verifyDeliveryCode,
} from "../controllers/pickupJobController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createPickupJob);
router.get("/mine", getMyPickupJobs);
router.get("/open", getOpenPickupJobs);
router.get("/matches/:tripId", getMatchedPickupJobs);
router.patch("/:id/accept", acceptPickupJob);
router.patch("/:id/confirm-pickup", verifyPickupCode);
router.patch("/:id/confirm-delivery", verifyDeliveryCode);
router.patch("/:id/cancel", cancelPickupJob);

export default router;
