import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["Online Consultation", "In-Person"],
      required: true,
    },
    startAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "Accepted", "Rejected", "Cancelled", "Completed"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

// Compound index for fetching a doctor's schedule for a specific time slot.
// `unique: true` prevents double booking for the same doctor at the same time if status is not "Cancelled".
appointmentSchema.index({ doctorId: 1, startAt: 1 }, { unique: true, partialFilterExpression: { status: { $ne: "Cancelled" } } });

// Compound index for fetching a user's appointment history, sorted by date.
appointmentSchema.index({ userId: 1, startAt: -1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
