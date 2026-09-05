import express from "express";
import {
  createContainer,
  getContainers,
  getMyContainers,
  getMyContainerById,
  departContainer,
  deliverContainer,
  updateContainerLocation,
  getContainerTracking,
} from "../controllers/containerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["provider"]), createContainer);
router.get("/", authMiddleware, getContainers);
router.get(
  "/my",
  authMiddleware,
  roleMiddleware(["provider"]),
  getMyContainers,
);

router.get(
  "/my/:id",
  authMiddleware,
  roleMiddleware(["provider"]),
  getMyContainerById,
);
router.patch(
  "/:id/depart",
  authMiddleware,
  roleMiddleware(["provider"]),
  departContainer,
);
router.patch(
  "/:id/deliver",
  authMiddleware,
  roleMiddleware(["provider"]),
  deliverContainer,
);
router.patch(
  "/:id/location",
  authMiddleware,
  roleMiddleware(["provider"]),
  updateContainerLocation,
);
router.get("/:id/tracking", authMiddleware, getContainerTracking);

export default router;
