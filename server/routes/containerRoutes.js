import express from "express";
import {
  createContainer,
  getContainers,
  departContainer,
  deliverContainer,
  updateContainerLocation,
} from "../controllers/containerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["provider"]), createContainer);
router.get("/", authMiddleware, getContainers);
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
  updateContainerLocation
);

export default router;
