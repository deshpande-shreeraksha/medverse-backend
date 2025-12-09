import express from "express";
import { body, validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import { signupUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Signup (to match frontend call)
router.post(
  "/signup",
  [
    body("firstName", "First name is required").not().isEmpty(),
    body("lastName", "Last name is required").not().isEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await signupUser(req, res);
  })
);

// Login
router.post(
  "/login",
  [
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password is required").exists(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    await loginUser(req, res);
  })
);

export default router;
