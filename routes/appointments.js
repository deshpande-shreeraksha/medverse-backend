// routes/api/appointments.js
import express from "express";
import { body, query, validationResult } from "express-validator";
import Appointment from "../models/Appointment.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

const router = express.Router();

// Connectivity test
router.get("/test", (req, res) => res.json({ message: "Appointments route working!" }));

router.get(
  "/booked-slots",
  auth,
  [query("doctorId").not().isEmpty(), query("date").optional().isISO8601().toDate()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { doctorId, date } = req.query;
    if (!date) return res.json([]);

    const startOfDay = new Date(date); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date);   endOfDay.setHours(23,59,59,999);

    const appointments = await Appointment
      .find({ doctorId, startAt: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: "Cancelled" } })
      .select("startAt -_id");

    const booked = appointments.map(a => {
      const h = a.startAt.getHours().toString().padStart(2,"0");
      const m = a.startAt.getMinutes().toString().padStart(2,"0");
      return `${h}:${m}`;
    });
    res.json(booked);
  })
);

router.get(
  "/doctor-schedule",
  auth,
  [query("date").optional().isISO8601().toDate()],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Find the logged-in user to get their public-facing doctorId
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'doctor') {
      res.status(403);
      throw new Error("Access denied. Not a valid doctor.");
    }

    const doctorId = req.userId; // Use the user's internal _id
    const selectedDate = req.query.date ? new Date(req.query.date) : new Date();

    const startOfDay = new Date(selectedDate); startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(selectedDate);   endOfDay.setUTCHours(23,59,59,999);

    const appointments = await Appointment
      .find({ doctorId, startAt: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: "Cancelled" } })
      .sort({ startAt: 1 })
      .populate("userId", "firstName lastName");

    res.json(appointments);
  })
);

router.get(
  "/",
  auth,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalAppointments = await Appointment.countDocuments({ userId: req.userId });
    const appointments = await Appointment.find({ userId: req.userId })
      .select("-doctorId")
      .sort({ startAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      appointments,
      currentPage: page,
      totalPages: Math.ceil(totalAppointments / limit),
      totalAppointments,
    });
  })
);

router.post(
  "/",
  auth,
  [
    body("doctorId").not().isEmpty(),
    body("doctorName").not().isEmpty(),
    body("specialization").not().isEmpty(),
    body("mode").isIn(["Online Consultation", "In-Person"]),
    body("date").isISO8601(),
    body("time").matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { doctorId, doctorName, specialization, mode, date, time } = req.body;
    // Create date at midnight in local timezone, then add the time
    const [hours, minutes] = time.split(':').map(Number);
    const startAt = new Date(date);
    startAt.setHours(hours, minutes, 0, 0);

    console.time("double-check");
    const existing = await Appointment.findOne({ doctorId, startAt, status: { $ne: "Cancelled" } });
    console.timeEnd("double-check");
    if (existing) {
      res.status(409);
      throw new Error("This time slot is already booked. Please choose another time.");
    }

    const appointment = await Appointment.create({
      userId: req.userId, doctorId, doctorName, specialization, mode, startAt, status: "Scheduled",
    });

    res.status(201).json({ message: "Appointment booked successfully!", appointment });
  })
);

router.patch("/:id/cancel", auth, asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, userId: req.userId });
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }
  appointment.status = "Cancelled";
  await appointment.save();
  res.json({ message: "Appointment cancelled successfully", appointment });
}));

// @route   PATCH /api/appointments/:id/confirm
// @desc    Doctor confirms an appointment
// @access  Private (Doctor)
router.patch("/:id/confirm", auth, asyncHandler(async (req, res) => {  
  const doctor = await User.findById(req.userId);
  if (!doctor || doctor.role !== 'doctor') {
    res.status(403);
    throw new Error("Forbidden: Only doctors can confirm appointments.");
  }

  const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: req.userId });
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found or you are not the assigned doctor.");
  }

  appointment.status = "Scheduled"; // Changing from "Pending" to "Scheduled"
  await appointment.save();
  res.json({ message: "Appointment confirmed successfully", appointment });
}));

// @route   PATCH /api/appointments/:id/reject
// @desc    Doctor rejects (cancels) an appointment
// @access  Private (Doctor)
router.patch("/:id/reject", auth, asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.userId);
  if (!doctor || doctor.role !== 'doctor') {
    res.status(403);
    throw new Error("Forbidden: Only doctors can reject appointments.");
  }

  const appointment = await Appointment.findOne({ _id: req.params.id, doctorId: req.userId });
  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found or you are not the assigned doctor.");
  }

  appointment.status = "Cancelled"; // Using "Cancelled" status for rejections
  // You could add a field like `cancellationReason: 'Rejected by doctor'` to the model for more detail.
  await appointment.save();
  res.json({ message: "Appointment cancelled successfully", appointment });
}));

export default router;
