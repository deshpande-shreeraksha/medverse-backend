import User from "../models/User.js";

// middleware to ensure the authenticated user has one of the allowed roles
const requireRole = (...allowedRoles) => async (req, res, next) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Not authenticated" });

    const user = await User.findById(req.userId).select("role firstName lastName");
    // also attach doctorId if present
    const userDoc = await User.findById(req.userId).select("doctorId");
    const doctorId = userDoc ? userDoc.doctorId : undefined;
    if (!user) return res.status(401).json({ message: "User not found" });

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // attach fresh user info
    req.user = req.user || {};
    req.user.role = user.role;
    req.user.firstName = user.firstName;
    req.user.lastName = user.lastName;
    req.user.doctorId = doctorId;

    next();
  } catch (err) {
    next(err);
  }
};

export default requireRole;
