import mongoose from "mongoose";

const privilegeSchema = new mongoose.Schema(
  {
    // Link to the user who applied
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true }, 
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Keep email for potential direct lookups
    familyMembers: { type: Number, required: true },
    idProof: { type: String },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

// Add an index for quickly fetching a user's privilege card application.
privilegeSchema.index({ userId: 1 }, { unique: true });

const PrivilegeApplication = mongoose.model("PrivilegeApplication", privilegeSchema);

export default PrivilegeApplication;
