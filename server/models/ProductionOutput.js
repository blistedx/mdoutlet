import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ProductionOutput extends Model {}

ProductionOutput.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    productionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'productions',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
    }
  },
  {
    sequelize,
    modelName: 'ProductionOutput',
    tableName: 'production_outputs',
    timestamps: true
  }
);

export default ProductionOutput;
