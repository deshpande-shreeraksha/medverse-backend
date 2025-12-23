// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";

// Route imports (adjust paths to match your structure)
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import appointmentRoutes from "./routes/appointments.js";
import labTestRoutes from "./routes/lab-tests.js";
import medicalRecordRoutes from "./routes/medical-records.js";
import privilegeRoutes from "./routes/privilegeRoutes.js";
import adminRoutes from "./routes/admin.js";
import doctorRoutes from "./routes/doctor.js";
import doctorsRoutes from "./routes/doctors.js";

// Middlewares
import errorHandler from "./middleware/errorHandler.js";
import requestTimer from "./middleware/requestTimer.js"; // create this per below

dotenv.config();
const app = express();

// Connect DB
await connectDB();

// Core middleware
app.use(cors({
  origin: [
    "http://localhost:3000",                           // Local development
    "https://medverse-frontend-mocha.vercel.app",      // Vercel production
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());

// Static for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// Request timing logs
app.use(requestTimer);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/lab-tests", labTestRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/privilege-card", privilegeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/doctors", doctorsRoutes);

// Error handler last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
