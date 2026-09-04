import express from "express";

import {
  createContainer,
  getContainers,
} from "../controllers/containerController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["provider"]), createContainer);

router.get("/", authMiddleware, getContainers);

export default router;
