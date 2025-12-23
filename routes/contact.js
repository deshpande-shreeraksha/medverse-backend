import express from 'express';
import { body, validationResult } from 'express-validator';
import asyncHandler from '../utils/asyncHandler.js';
import Feedback from '../models/Feedback.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public: Submit feedback / contact message
router.post(
  '/',
  [
    body('name').not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('message').isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, phone = '', subject = '', message } = req.body;
    const feedback = await Feedback.create({
      name,
      email,
      phone,
      subject,
      message,
      userId: req.userId || null,
    });

    res.status(201).json({ message: 'Feedback submitted', feedback });
  })
);

// Optional: allow authenticated user to submit with token (auth middleware will set req.userId)
router.post('/auth', auth, asyncHandler(async (req, res) => {
  const { name, email, phone = '', subject = '', message } = req.body;
  const feedback = await Feedback.create({ name, email, phone, subject, message, userId: req.userId });
  res.status(201).json({ message: 'Feedback submitted', feedback });
}));

export default router;
