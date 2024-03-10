import connection from "./index.js";
import { DataTypes } from "sequelize";
import AnalysisData from "./AnalysisData.js";
import Energy from "./Energy.js";
import EnergyPurchase from "./EnergyPurchase.js";

const User = connection.define(
  "User",
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 255], // Minimum and maximum length
          msg: "Password must be at least 8 characters long",
        },
      },
      isNumeric: {
        msg: "Password must contain at least one number",
      },
    },
    shop_name: {
      type: DataTypes.STRING,
    },
    owner_name: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default value is false until email is verified
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user", // Default role is 'user'
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

User.hasMany(EnergyPurchase,{
  onDelete : "CASCADE",
  onUpdate : "CASCADE",
})
EnergyPurchase.belongsTo(User);

//one to many (user and analysisdata)
User.hasMany(AnalysisData,{
  onDelete : 'CASCADE',
  onUpdate : 'CASCADE'
});

//one to one from user to energy_count
User.hasOne(Energy,{
  onDelete : "CASCADE",
  onUpdate :"CASCADE",
});
Energy.belongsTo(User);

export default User;