import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class AuditLog extends Model {}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    userName: {
      type: DataTypes.STRING(100),
      defaultValue: 'System'
    },
    userRole: {
      type: DataTypes.STRING(50),
      defaultValue: 'staff'
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    entityId: {
      type: DataTypes.STRING(100),
      defaultValue: ''
    },
    details: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      defaultValue: '127.0.0.1'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true
  }
);

export default AuditLog;
