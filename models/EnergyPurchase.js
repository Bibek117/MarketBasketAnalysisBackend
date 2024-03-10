import connection from './index.js';
import { DataTypes } from 'sequelize';

const EnergyPurchase = connection.define(
  "EnergyPurchase",
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transaction_code: {
      type: DataTypes.STRING,
    },
    transaction_uuid: {
      type: DataTypes.STRING,
      allowNull : false,
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

export default EnergyPurchase;