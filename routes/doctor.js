import express from "express";
import { body, validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import auth from "../middleware/auth.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { upload } from "../config/upload.js";

const router = express.Router();

// @route   GET /api/doctor/appointments
// @desc    Get all appointments for the logged-in doctor
// @access  Private (Doctor)
router.get("/appointments", auth, asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const user = await User.findById(req.userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    let query = { doctorId: req.userId };

    if (search) {
        const searchRegex = new RegExp(search, 'i');
        const patients = await User.find({
            $or: [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }]
        }).select('_id');
        
        query.userId = { $in: patients.map(p => p._id) };
    }

    const totalAppointments = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate("userId", "firstName lastName email")
      .sort({ startAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      appointments,
      currentPage: page,
      totalPages: Math.ceil(totalAppointments / limit),
    });
}));

// @route   GET /api/doctor/profile
// @desc    Get doctor's own profile
// @access  Private (Doctor)
router.get("/profile", auth, asyncHandler(async (req, res) => {
    const profile = await User.findById(req.userId).select("-password");
    if (!profile) {
        res.status(404);
        throw new Error("Profile not found");
    }
    res.json(profile);
}));

// @route   PUT /api/doctor/profile
// @desc    Update doctor's own profile
// @access  Private (Doctor)
router.put("/profile", auth, upload.single('profilePicture'), [
    body("firstName").not().isEmpty(),
    body("lastName").not().isEmpty(),
    body("specialization").optional().isString(),
    body("bio").optional().isString().isLength({ max: 500 }).withMessage("Bio must not exceed 500 characters"),
    body("qualifications").optional().isString(),
    body("consultationFee").optional().isNumeric().withMessage("Consultation fee must be a number."),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Filter allowed fields to prevent security issues (e.g. changing role)
    const { firstName, lastName, phone, dateOfBirth, bloodType, specialization, bio, qualifications, consultationFee, location } = req.body;
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (bloodType) updateData.bloodType = bloodType;
    if (specialization) updateData.specialization = specialization;
    if (bio) updateData.bio = bio;
    if (qualifications) updateData.qualifications = qualifications;
    if (consultationFee) updateData.consultationFee = consultationFee;
    if (location) updateData.location = location;

    if (req.file) {
        updateData.profilePictureUrl = `/uploads/${req.file.filename}`;
    }

    const profile = await User.findByIdAndUpdate(req.userId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).select("-password");

    // If the user is a doctor, update their name in all associated appointments
    if (profile.role === 'doctor') {
        const newDoctorName = `${profile.firstName} ${profile.lastName}`;
        await Appointment.updateMany(
            { doctorId: profile._id },
            { $set: { doctorName: newDoctorName } }
        );
    }

    res.json(profile);
}));

// @route   GET /api/doctor/availability
// @desc    Get doctor's own availability
// @access  Private (Doctor)
router.get("/availability", auth, asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select("availability");
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.json(user.availability);
}));

// @route   PUT /api/doctor/availability
// @desc    Update doctor's own availability
// @access  Private (Doctor)
router.put("/availability", auth, asyncHandler(async (req, res) => {
    const { availability } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    user.availability = availability;
    await user.save();
    res.json({ message: "Availability updated successfully", availability: user.availability });
}));

// @route   POST /api/doctor/register
// @desc    Register doctor to be visible in public doctors list (one-time action)
// @access  Private (Doctor)
router.post("/register", auth, asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) {
        res.status(404);
        throw new Error("Doctor not found");
    }
    if (user.role !== 'doctor') {
        res.status(403);
        throw new Error("Only doctors can use this endpoint");
    }
    if (user.isRegistered) {
        res.status(400);
        throw new Error("Doctor is already registered");
    }
    user.isRegistered = true;
    await user.save();
    res.json({ message: "Doctor registered successfully and is now visible in the doctors list", doctor: user });
}));

export default router;