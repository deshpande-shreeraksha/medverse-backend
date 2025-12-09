import express from "express";
import { body, validationResult } from "express-validator";
import auth from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
} from "../controllers/userController.js";

const router = express.Router();

// GET /api/users/me - profile
router.get("/me", auth, asyncHandler(getUserProfile));

// PUT /api/users/me - update profile (firstName, lastName, email, phone, dateOfBirth, bloodType)
router.put(
  "/me",
  auth,
  [
    body("firstName", "First name is required").not().isEmpty(),
    body("lastName", "Last name is required").not().isEmpty(),
    body("email", "Please include a valid email").optional().isEmail(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await updateUserProfile(req, res);
  })
);

// PUT /api/users/change-password - change password
router.put(
  "/change-password",
  auth,
  [
    body("oldPassword", "Old password is required").not().isEmpty(),
    body("newPassword", "New password must be at least 6 characters").isLength({ min: 6 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await changePassword(req, res);
  })
);

// DELETE /api/users/me - delete account
router.delete("/me", auth, asyncHandler(deleteUserAccount));

export default router;
