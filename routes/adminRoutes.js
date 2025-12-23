import express from 'express';
import auth from '../middleware/auth.js';
import requireRole from '../middleware/roleCheck.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getAudits,
  exportAppointments
} from '../controllers/adminController.js';

const router = express.Router();

// User Management
router.route('/users')
  .post(auth, requireRole('admin'), asyncHandler(createUser))
  .get(auth, requireRole('admin'), asyncHandler(getUsers));
router.route('/users/:id').get(auth, requireRole('admin'), asyncHandler(getUser))
  .put(auth, requireRole('admin'), asyncHandler(updateUser))
  .delete(auth, requireRole('admin'), asyncHandler(deleteUser));

// Appointment Management
router.route('/appointments').get(auth, requireRole('admin'), asyncHandler(getAppointments));
router.route('/appointments/:id/cancel').patch(auth, requireRole('admin'), asyncHandler(cancelAppointment));
router.route('/appointments/:id/reschedule').patch(auth, requireRole('admin'), asyncHandler(rescheduleAppointment));
router.route('/appointments/export').get(auth, requireRole('admin'), asyncHandler(exportAppointments));

router.route('/audits').get(auth, requireRole('admin'), asyncHandler(getAudits));

export default router;