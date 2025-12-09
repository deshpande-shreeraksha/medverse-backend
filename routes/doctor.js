import express from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/roleCheck.js";
import asyncHandler from "../utils/asyncHandler.js";
import { upload } from "../config/upload.js";
import { getDoctorAppointments, uploadReportForAppointment, getUserPrivilege, updateAppointmentStatus, updateLabTest, getPatientDetails } from "../controllers/doctorController.js";

const router = express.Router();

// Only doctors should access these routes
router.get("/appointments", auth, requireRole("doctor"), asyncHandler(getDoctorAppointments));

router.post(
  "/appointments/:id/report",
  auth,
  requireRole("doctor"),
  upload.single("file"),
  asyncHandler(uploadReportForAppointment)
);

router.get("/user/:id/privilege", auth, requireRole("doctor"), asyncHandler(getUserPrivilege));

router.patch("/appointments/:id/status", auth, requireRole("doctor"), asyncHandler(updateAppointmentStatus));

router.patch("/lab-tests/:id", auth, requireRole("doctor"), asyncHandler(updateLabTest));

router.get("/user/:id/details", auth, requireRole("doctor"), asyncHandler(getPatientDetails));

export default router;
