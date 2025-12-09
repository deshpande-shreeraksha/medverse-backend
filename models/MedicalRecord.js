import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recordType:    { type: String, enum: ["Prescription", "Report", "Diagnosis", "Medical History"], required: true },
  title:         { type: String, required: true },
  doctorName:    { type: String, required: true },
  date:          { type: Date, required: true },
  description:   { type: String, default: "" },
  fileUrl:       { type: String, default: "" },
  notes:         { type: String, default: "" },
  createdAt:     { type: Date, default: Date.now },
});

// Add an index for quickly fetching records for a specific user.
medicalRecordSchema.index({ userId: 1, date: -1 });

export default mongoose.model("MedicalRecord", medicalRecordSchema);
