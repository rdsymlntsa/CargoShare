import express from "express";
import { createContainer } from "../controllers/containerController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import providerMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, providerMiddleware, createContainer);

export default router;
