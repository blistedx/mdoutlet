import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  req,
  action,
  entityType,
  entityId,
  details
}) => {
  try {
    const userId = req?.user?.id || req?.user?._id;
    const userName = req?.user?.name || 'System Auto';
    const userRole = req?.user?.role || 'system';
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '127.0.0.1';


    if (!userId) return;

    await AuditLog.create({
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId: entityId ? entityId.toString() : undefined,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      ipAddress,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Failed to write audit log entry:', err.message);
  }
};
