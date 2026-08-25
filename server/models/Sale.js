import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Sale extends Model {}

Sale.init(
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
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0
    },
    costPriceSnapshot: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.0
    },
    customerName: {
      type: DataTypes.STRING(150),
      defaultValue: 'Walk-in Customer'
    },
    outletOrRoute: {
      type: DataTypes.STRING(100),
      defaultValue: 'Counter POS'
    },
    paymentMode: {
      type: DataTypes.ENUM('Cash', 'UPI', 'Card', 'Credit'),
      defaultValue: 'Cash'
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    addedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    }
  },
  {
    sequelize,
    modelName: 'Sale',
    tableName: 'sales',
    timestamps: true
  }
);

export default Sale;
