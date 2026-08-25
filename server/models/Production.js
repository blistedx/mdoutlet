import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Production extends Model {}

Production.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    batchDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    rawMilkProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'RESTRICT'
    },
    inputQuantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.1
      }
    },
    wastage: {
      type: DataTypes.FLOAT,
      defaultValue: 0
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
    modelName: 'Production',
    tableName: 'productions',
    timestamps: true
  }
);

export default Production;
