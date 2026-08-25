import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { logAudit } from '../middleware/auditLogger.js';

// @route   GET /api/users
// @desc    List all staff & admin accounts
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const formattedUsers = users.map((u) => {
      const j = u.toJSON();
      j._id = j.id;
      return j;
    });

    res.status(200).json({ success: true, count: formattedUsers.length, users: formattedUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/users/:id
// @desc    Update staff user details / role / status
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, role, phone, isActive, password } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (role && ['admin', 'staff'].includes(role)) user.role = role;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    await logAudit({
      req,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user.id,
      details: `Admin updated user ${user.name} (${user.email}) - Role: ${user.role}, Active: ${user.isActive}`
    });

    res.status(200).json({
      success: true,
      message: `User ${user.name} updated successfully`,
      user: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const currentUserId = (req.user?.id || req.user?._id)?.toString();
    if (req.params.id === currentUserId) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own active administrator account' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userName = user.name;
    const userEmail = user.email;

    await user.destroy();

    await logAudit({
      req,
      action: 'DELETE',
      entityType: 'User',
      entityId: req.params.id,
      details: `Admin deleted user account ${userName} (${userEmail})`
    });

    res.status(200).json({ success: true, message: `User ${userName} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
