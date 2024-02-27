module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
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
    });

  return User;
};
