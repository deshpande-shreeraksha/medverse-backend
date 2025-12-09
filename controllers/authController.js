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
  const { firstName, lastName, email, password, role = "patient", doctorId = "" } = req.body;

  // Validate role value
  const allowedRoles = ["patient", "doctor", "admin"];
  if (!allowedRoles.includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  // If role is doctor, validate doctorId format (exactly 5 digits)
  if (role === "doctor") {
    const re = /^\d{5}$/;
    if (!re.test((doctorId || "").toString())) {
      res.status(400);
      throw new Error("Doctor ID must be exactly 5 digits");
    }
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
  if (role === "doctor") createObj.doctorId = doctorId || "";

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
        doctorId: user.doctorId || "",
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
    const token = generateToken(user);
    res.json({
      token,
      user: { id: user._id, firstName: user.firstName, email: user.email, role: user.role, doctorId: user.doctorId || "" },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
};