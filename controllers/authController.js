import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Utility to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, firstName: user.firstName },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signupUser = async (req, res) => {
  const { firstName, lastName, email, password, role = "patient" } = req.body;

  // Validate role value
  const allowedRoles = ["patient", "doctor", "admin"];
  if (!allowedRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with that email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const createObj = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
  };

  const user = await User.create(createObj);

  if (user) {
    const token = generateToken(user);
    res.status(201).json({
      message: "Signup successful!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    // If it's a doctor login, verify their doctorId matches
    // No legacy doctorId check — authentication is email/password-based

    // Auto-promote support email to admin in the database to fix 403 errors
    if (user.email.toLowerCase() === 'support@medverse.com' && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    const token = generateToken(user);

    // Create a user object to send to the frontend, allowing for overrides
    const userPayload = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePictureUrl: user.profilePictureUrl || ""
    };

    // If the user is the special support email, ensure their role is admin
    if (userPayload.email.toLowerCase() === 'support@medverse.com') {
      userPayload.role = 'admin';
    }

    res.json({
      token,
      user: userPayload,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
};

// Legacy numeric Doctor ID removed from project.
