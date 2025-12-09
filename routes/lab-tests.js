import express from "express";
import auth from "../middleware/auth.js";
import LabTest from "../models/LabTest.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

// GET /api/lab-tests - get all lab tests for user
router.get("/", auth, asyncHandler(async (req, res) => {
  const tests = await LabTest.find({ userId: req.userId }).sort({ testDate: -1 });
  res.json(tests);
}));

// POST /api/lab-tests - create new lab test (admin/doctor only - for now allow authenticated)
router.post("/", auth, asyncHandler(async (req, res) => {
  const { testName, testDate, status, result, normalRange, notes } = req.body;

  if (!testName || !testDate) {
    res.status(400);
    throw new Error("Test name and date are required");
  }

  const test = await LabTest.create({
    userId: req.userId,
    testName,
    testDate,
    status: status || "Pending",
    result,
    normalRange,
    notes,
  });

  res.status(201).json({ message: "Lab test created", test });
}));

// GET /api/lab-tests/:id - get specific lab test
router.get("/:id", auth, asyncHandler(async (req, res) => {
  const test = await LabTest.findOne({ _id: req.params.id, userId: req.userId });
  if (!test) {
    res.status(404);
    throw new Error("Lab test not found");
  }
  res.json(test);
}));

// PUT /api/lab-tests/:id - update lab test
router.put("/:id", auth, asyncHandler(async (req, res) => {
  const { testName, testDate, status, result, normalRange, notes } = req.body;

  const test = await LabTest.findOne({ _id: req.params.id, userId: req.userId });
  if (!test) {
    res.status(404);
    throw new Error("Lab test not found");
  }

  // Update fields
  Object.assign(test, req.body);

  await test.save();
  res.json({ message: "Lab test updated", test });
}));

// DELETE /api/lab-tests/:id - delete lab test
router.delete("/:id", auth, asyncHandler(async (req, res) => {
  const test = await LabTest.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!test) {
    res.status(404);
    throw new Error("Lab test not found");
  }
  res.json({ message: "Lab test deleted" });
}));

export default router;
