import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Feedback extends Model {}

Feedback.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    customerName: {
      type: DataTypes.STRING(150),
      defaultValue: 'Anonymous Customer'
    },
    phone: {
      type: DataTypes.STRING(30),
      defaultValue: ''
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: 'Overall Experience'
    },
    comment: {
      type: DataTypes.TEXT,
      defaultValue: ''
    },
    status: {
      type: DataTypes.ENUM('new', 'reviewed', 'featured'),
      defaultValue: 'new'
    }
  },
  {
    sequelize,
    modelName: 'Feedback',
    tableName: 'feedbacks',
    timestamps: true
  }
);

export default Feedback;
