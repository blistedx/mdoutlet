import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Stock extends Model {}

Stock.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'products',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    currentQuantity: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    reorderThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 20
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'Stock',
    tableName: 'stocks',
    timestamps: true
  }
);

export default Stock;
