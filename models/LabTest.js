import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  testName:      { type: String, required: true },
  testDate:      { type: Date, required: true },
  status:        { type: String, enum: ["Pending", "Completed", "Normal", "Abnormal"], default: "Pending" },
  result:        { type: String, default: "" },
  normalRange:   { type: String, default: "" },
  reportUrl:     { type: String, default: "" },
  notes:         { type: String, default: "" },
  createdAt:     { type: Date, default: Date.now },
});

// Add an index for quickly fetching lab tests for a specific user.
labTestSchema.index({ userId: 1, testDate: -1 });

export default mongoose.model("LabTest", labTestSchema);
