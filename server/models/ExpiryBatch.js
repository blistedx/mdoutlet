import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ExpiryBatch extends Model {}

ExpiryBatch.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    batchNumber: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    manufactureDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('fresh', 'near-expiry', 'expired', 'discarded'),
      defaultValue: 'fresh'
    },
    addedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    notes: {
      type: DataTypes.TEXT,
      defaultValue: ''
    }
  },
  {
    sequelize,
    modelName: 'ExpiryBatch',
    tableName: 'expiry_batches',
    timestamps: true
  }
);

export default ExpiryBatch;
