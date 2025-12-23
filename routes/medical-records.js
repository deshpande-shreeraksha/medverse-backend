import express from "express";
import auth from "../middleware/auth.js";
import MedicalRecord from "../models/MedicalRecord.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/medical-records - get all medical records for user
router.get("/", auth, asyncHandler(async (req, res) => {
  const records = await MedicalRecord.find({ userId: req.userId }).sort({ date: -1 });
  res.json(records);
}));

// GET /api/medical-records/patient/:patientId - get records for a specific patient (doctor only)
router.get("/patient/:patientId", auth, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user || (user.role !== 'doctor' && user.role !== 'admin')) {
    res.status(403);
    throw new Error("Access denied. Doctors only.");
  }
  const records = await MedicalRecord.find({ userId: req.params.patientId }).sort({ date: -1 });
  res.json(records);
}));

// POST /api/medical-records - create new medical record
router.post("/", auth, asyncHandler(async (req, res) => {
  const { recordType, title, doctorName, date, description, notes } = req.body;

  if (!recordType || !title || !doctorName || !date) {
    res.status(400);
    throw new Error("Record type, title, doctor name, and date are required");
  }

  const record = await MedicalRecord.create({
    userId: req.userId,
    recordType,
    title,
    doctorName,
    date,
    description,
    notes,
  });

  res.status(201).json({ message: "Medical record created", record });
}));

// GET /api/medical-records/:id - get specific medical record
router.get("/:id", auth, asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOne({ _id: req.params.id, userId: req.userId });
  if (!record) {
    res.status(404);
    throw new Error("Medical record not found");
  }
  res.json(record);
}));

// PUT /api/medical-records/:id - update medical record
router.put("/:id", auth, asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOne({ _id: req.params.id, userId: req.userId });
  if (!record) {
    res.status(404);
    throw new Error("Medical record not found");
  }

  // Update fields
  Object.assign(record, req.body);

  await record.save();
  res.json({ message: "Medical record updated", record });
}));

// DELETE /api/medical-records/:id - delete medical record
router.delete("/:id", auth, asyncHandler(async (req, res) => {
  const record = await MedicalRecord.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!record) {
    res.status(404);
    throw new Error("Medical record not found");
  }
  res.json({ message: "Medical record deleted" });
}));

export default router;
