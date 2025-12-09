import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true },
  phone:     { type: String, default: "" },
  dateOfBirth: { type: Date },
  bloodType: { type: String, default: "" },
  // Role: determines whether the user is a patient, doctor or admin
  role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
  // If the user is a doctor, store an external doctor identifier (license/id)
  doctorId: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
