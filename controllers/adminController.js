import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
// import Audit from '../models/Audit.js'; // Uncomment if you have an Audit model

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  
  const keyword = req.query.search ? {
    $or: [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ]
  } : {};

  const roleFilter = req.query.role ? { role: req.query.role } : {};

  const count = await User.countDocuments({ ...keyword, ...roleFilter });
  const users = await User.find({ ...keyword, ...roleFilter })
    .select('-password')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ users, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phone = req.body.phone || user.phone;
    if (req.body.doctorId !== undefined) user.doctorId = req.body.doctorId;

    const updatedUser = await user.save();
    
    res.json({
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        doctorId: updatedUser.doctorId
      }
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};

// @desc    Get all appointments (Admin)
// @route   GET /api/admin/appointments
// @access  Private/Admin
export const getAppointments = async (req, res) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  let query = {};
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.doctor) {
    query.$or = [
      { doctorName: { $regex: req.query.doctor, $options: 'i' } },
      { doctorId: { $regex: req.query.doctor, $options: 'i' } }
    ];
  }

  const count = await Appointment.countDocuments(query);
  const appointments = await Appointment.find(query)
    .populate('userId', 'firstName lastName email')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ startAt: -1 });

  res.json({ appointments, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Cancel appointment
// @route   PATCH /api/admin/appointments/:id/cancel
// @access  Private/Admin
export const cancelAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (appointment) {
    appointment.status = 'Cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled', appointment });
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
};

// @desc    Reschedule appointment
// @route   PATCH /api/admin/appointments/:id/reschedule
// @access  Private/Admin
export const rescheduleAppointment = async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (appointment) {
    appointment.startAt = req.body.startAt;
    appointment.status = 'Scheduled'; // Reset status if it was cancelled
    await appointment.save();
    res.json({ message: 'Appointment rescheduled', appointment });
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audits
// @access  Private/Admin
export const getAudits = async (req, res) => {
  // Placeholder if Audit model is not yet created
  // const pageSize = Number(req.query.limit) || 20;
  // const page = Number(req.query.page) || 1;
  // const count = await Audit.countDocuments({});
  // const audits = await Audit.find({}).sort({ createdAt: -1 })...
  
  res.json({ audits: [], page: 1, pages: 1, total: 0 });
};

// @desc    Export appointments
// @route   GET /api/admin/appointments/export
// @access  Private/Admin
export const exportAppointments = async (req, res) => {
  // Basic CSV export logic can be added here
  res.status(200).send("Date,Doctor,Patient,Status\n"); 
};