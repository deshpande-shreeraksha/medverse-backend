import Appointment from "../models/Appointment.js";
import MedicalRecord from "../models/MedicalRecord.js";
import LabTest from "../models/LabTest.js";
import path from "path";

// GET /api/doctor/appointments
export const getDoctorAppointments = async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : null;
  // doctorId stored on Appointment is the external doctor identifier (string).
  // Use the authenticated user's doctorId when available, otherwise fall back to the Mongo userId.
  const authDoctorId = req.user && req.user.doctorId ? req.user.doctorId : req.userId;
  let filter = { doctorId: authDoctorId };
  if (date) {
    const startOfDay = new Date(date); startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(date); endOfDay.setUTCHours(23,59,59,999);
    filter.startAt = { $gte: startOfDay, $lte: endOfDay };
  }

  const appointments = await Appointment.find(filter).sort({ startAt: 1 }).populate("userId", "firstName lastName email");
  res.json({ appointments });
};

// POST /api/doctor/appointments/:id/report
// Accepts multipart/form-data: 'file' (pdf/image) and 'notes', 'title'
export const uploadReportForAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  const authDoctorId2 = req.user && req.user.doctorId ? req.user.doctorId : req.userId;
  if (appointment.doctorId !== authDoctorId2) return res.status(403).json({ message: "Not your appointment" });

  const file = req.file;
  const notes = req.body.notes || "";
  const title = req.body.title || "Lab Report";
  const doctorName = req.user.firstName ? `${req.user.firstName} ${req.user.lastName || ""}`.trim() : req.userId;

  const fileUrl = file ? `/uploads/${file.filename}` : "";

  const newRecord = await MedicalRecord.create({
    userId: appointment.userId,
    recordType: "Report",
    title,
    doctorName,
    date: new Date(),
    description: notes,
    fileUrl,
  });

  // Optionally mark appointment as Completed
  appointment.status = "Completed";
  await appointment.save();

  res.json({ message: "Report uploaded", record: newRecord });
};

// GET /api/doctor/user/:id/privilege
import PrivilegeApplication from "../models/PrivilegeApplication.js";
export const getUserPrivilege = async (req, res) => {
  const userId = req.params.id;
  const app = await PrivilegeApplication.findOne({ userId });
  if (!app) return res.status(404).json({ message: "No privilege application found" });
  res.json(app);
};

// PATCH /api/doctor/appointments/:id/status
export const updateAppointmentStatus = async (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;
  const allowed = ["Accepted", "Rejected", "Cancelled", "Completed", "Scheduled"];
  if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) return res.status(404).json({ message: "Appointment not found" });
  const authDoctorId3 = req.user && req.user.doctorId ? req.user.doctorId : req.userId;
  if (appointment.doctorId !== authDoctorId3) return res.status(403).json({ message: "Not your appointment" });

  appointment.status = status;
  await appointment.save();
  res.json({ message: "Status updated", appointment });
};

// PATCH /api/doctor/lab-tests/:id
export const updateLabTest = async (req, res) => {
  const labId = req.params.id;
  const { status, result, notes } = req.body;
  const lab = await LabTest.findById(labId);
  if (!lab) return res.status(404).json({ message: "Lab test not found" });

  // No doctorId on LabTest model; allow doctors to edit any for now
  if (status) lab.status = status;
  if (result) lab.result = result;
  if (notes) lab.notes = notes;
  await lab.save();
  res.json({ message: "Lab test updated", lab });
};

// GET /api/doctor/user/:id/details
import User from "../models/User.js";
export const getPatientDetails = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId).select("firstName lastName email phone dateOfBirth bloodType createdAt");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};
