import { Op } from 'sequelize';
import { AuditLog, User } from '../models/index.js';

// @route   GET /api/audit-logs
// @desc    Get audit trail entries with filtering (Admin only)
// @access  Private/Admin
export const getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, userId, search, limit, page } = req.query;
    const where = {};

    if (action && action !== 'all') {
      where.action = action;
    }

    if (entityType && entityType !== 'all') {
      where.entityType = entityType;
    }

    if (userId) {
      where.userId = userId;
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      where[Op.or] = [
        { userName: { [Op.like]: s } },
        { details: { [Op.like]: s } },
        { entityId: { [Op.like]: s } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: logs } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['timestamp', 'DESC']],
      offset,
      limit: limitNum
    });

    const formattedLogs = logs.map((l) => {
      const j = l.toJSON();
      j._id = j.id;
      if (j.user) {
        j.user._id = j.user.id;
        j.userId = j.user;
      }
      return j;
    });

    res.status(200).json({
      success: true,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
      logs: formattedLogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
