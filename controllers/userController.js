import User from "../models/User.js";
import bcrypt from "bcryptjs";

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
export const getUserProfile = async (req, res) => {
  // req.userId is attached by the auth middleware
  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { firstName, lastName, email, phone, dateOfBirth, bloodType } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("Email already in use");
    }
  }

  user.firstName = firstName || user.firstName;
  user.lastName = lastName || user.lastName;
  user.email = email || user.email;
  user.phone = phone ?? user.phone; // Allow clearing the phone number
  user.dateOfBirth = dateOfBirth || user.dateOfBirth;
  user.bloodType = bloodType ?? user.bloodType;

  const updatedUser = await user.save();

  res.json({
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      dateOfBirth: updatedUser.dateOfBirth,
      bloodType: updatedUser.bloodType,
    },
  });
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Old password is incorrect");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully" });
};

// @desc    Delete user account
// @route   DELETE /api/users/me
// @access  Private
export const deleteUserAccount = async (req, res) => {
  const user = await User.findByIdAndDelete(req.userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // In a real app, you might also want to delete related data like appointments.
  res.json({ message: "Account deleted successfully" });
};