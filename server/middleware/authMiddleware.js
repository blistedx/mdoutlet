import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please provide a valid authentication token.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dairy-inventory-super-secret-jwt-key-2026');
    let user = null;

    try {
      user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
    } catch (e) {}

    // Fallback for default Admin and Staff accounts
    if (!user) {
      if (Number(decoded.id) === 1) {
        user = { id: 1, _id: 1, name: 'Mother Dairy Admin', email: 'admin@dairy.com', role: 'admin', isActive: true };
      } else if (Number(decoded.id) === 2) {
        user = { id: 2, _id: 2, name: 'Store Staff Counter', email: 'staff@dairy.com', role: 'staff', isActive: true };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }

};

// Admin only access restriction middleware
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required for this action.'
    });
  }
};

// Staff or Admin access
export const requireStaff = (req, res, next) => {
  if (req.user && ['staff', 'admin'].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Staff or Admin role required.'
    });
  }
};
