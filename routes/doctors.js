import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all registered doctors (visible to public)
// @access  Public
router.get("/", asyncHandler(async (req, res) => {
    // Return all users with the 'doctor' role who are registered
    const doctors = await User.find({ role: 'doctor', isRegistered: true }).select("firstName lastName specialization bio qualifications profilePictureUrl consultationFee location");
    res.json(doctors);
}));

// @route   GET /api/doctors/:id
// @desc    Get specific doctor by public ID
// @access  Public
router.get("/:id", asyncHandler(async (req, res) => {
    const doctor = await User.findById(req.params.id).select("firstName lastName specialization bio qualifications profilePictureUrl consultationFee");
    if (!doctor) {
        res.status(404);
        throw new Error("Doctor not found");
    }
    res.json(doctor);
}));

// @route   GET /api/doctors/:id/availability
// @desc    Get a specific doctor's availability schedule
// @access  Public
router.get("/:id/availability", asyncHandler(async (req, res) => {
    // We find the doctor user by their internal _id
    const doctor = await User.findById(req.params.id).select("availability");

    if (!doctor || !doctor.availability) {
        res.status(404);
        throw new Error("Doctor not found or has no availability set.");
    }
    res.json(doctor.availability);
}));

export default router;