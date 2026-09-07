import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/profile", authMiddleware, updateProfile);
router.patch("/change-password", authMiddleware, changePassword);

export default router;
