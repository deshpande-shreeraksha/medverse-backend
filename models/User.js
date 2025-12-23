import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  day: { type: String, required: true, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
  isAvailable: { type: Boolean, default: false },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
}, { _id: false });

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
  profilePictureUrl: { type: String, default: "" },

  // Doctor-specific fields
  specialization: { type: String, default: "" },
  // Public location/clinic/hospital info displayed on doctors listing
  location: { type: String, default: "" },
  bio: { type: String, default: "", maxlength: 500 },
  qualifications: { type: String, default: "" },
  consultationFee: { type: Number, default: 500, min: 0 },

  availability: {
    type: [availabilitySchema],
    default: () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => ({
      day,
      isAvailable: !['Sunday', 'Saturday'].includes(day),
      startTime: '09:00',
      endTime: '17:00'
    }))
  },
  isRegistered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
