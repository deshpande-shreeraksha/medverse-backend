// In privilegeRoutes.js
import express from "express";
import PrivilegeApplication from "../models/PrivilegeApplication.js";
import { upload } from "../config/upload.js"; // Correctly using named import
import auth from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// GET /api/privilege-card/me - Get card for logged-in user
router.get("/me", auth, asyncHandler(async (req, res) => {
  // req.userId is attached by the auth middleware
  const card = await PrivilegeApplication.findOne({ userId: req.userId });
  if (!card) {
    res.status(404);
    throw new Error("No privilege card found for this user.");
  }
  res.json(card);
}));

// POST /api/privilege-card (with file upload)
router.post(
  "/",
  auth,
  upload.single("idProof"),
  [
    body("name", "Name is required").not().isEmpty(),
    body("email", "A valid email is required").isEmail(),
    body("familyMembers", "Family members must be a number between 0 and 4").isInt({ min: 0, max: 4 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      // Combine validation errors into a single message
      const errorMessages = errors.array().map(e => e.msg).join(', ');
      throw new Error(errorMessages);
    }

    const { name, email, familyMembers } = req.body;
    const idProofPath = req.file ? `/uploads/${req.file.filename}` : null;

    const application = await PrivilegeApplication.create({
      userId: req.userId, // Link the application to the logged-in user
      name,
      email,
      familyMembers: parseInt(familyMembers),
      idProof: idProofPath,
    });

    res.status(201).json({ message: "Application submitted successfully!", application });
  })
);

export default router;