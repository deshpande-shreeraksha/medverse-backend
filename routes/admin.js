import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
  exportAppointments,
  getAudits
} from "../controllers/adminController.js";
import Feedback from "../models/Feedback.js";

// Admin: list feedback messages
const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().sort({ createdAt: -1 });
  res.json(feedback);
});

const router = express.Router();

// All admin routes require authentication and admin role
router.get("/users", protect, admin, asyncHandler(getUsers));
router.get("/users/:id", protect, admin, asyncHandler(getUser));
router.put("/users/:id", protect, admin, asyncHandler(updateUser));
router.delete("/users/:id", protect, admin, asyncHandler(deleteUser));

// Appointments
router.get('/appointments', protect, admin, asyncHandler(getAppointments));
router.patch('/appointments/:id/cancel', protect, admin, asyncHandler(cancelAppointment));
router.patch('/appointments/:id/reschedule', protect, admin, asyncHandler(rescheduleAppointment));
router.get('/appointments/export', protect, admin, asyncHandler(exportAppointments));

router.get('/audits', protect, admin, asyncHandler(getAudits));
// Feedback listing for admins
router.get('/feedback', protect, admin, getFeedback);

export default router;
