import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import containerRoutes from "./routes/containerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/containers", containerRoutes);
app.use("/api/bookings", bookingRoutes);

// app.get("/api/auth/me", authMiddleware, (req, res) => {
//   res.json({
//     user: req.user,
//   });
// });

app.get("/", (req, res) => {
  res.json({
    message: "CargoShare API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
