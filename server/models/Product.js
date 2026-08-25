import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Product name is required' }
      }
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'milk'
    },
    unit: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'litre'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0
      }
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      validate: {
        min: 0
      }
    },
    qrCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      defaultValue: ''
    },
    shelfLifeDays: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      validate: {
        min: 1
      }
    },
    reorderThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
      validate: {
        min: 1
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true
  }
);

export default Product;
