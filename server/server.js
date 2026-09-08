import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import containerRoutes from "./routes/containerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/messageRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const server = createServer(app);

app.use(
  cors({
    origin: ["http://localhost:5173", "https://cargoshare-green.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
connectDB();
app.use("/api/auth", authRoutes);
app.use("/api/containers", containerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

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

export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://cargoshare-green.vercel.app"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinBooking", (bookingId) => {
    socket.join(`booking:${bookingId}`);

    console.log(`Socket ${socket.id} joined booking ${bookingId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
