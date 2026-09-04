import express from "express";
import {
  createContainer,
  getContainers,
} from "../controllers/containerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import providerMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, providerMiddleware, createContainer);
router.get("/", authMiddleware, getContainers);

export default router;
