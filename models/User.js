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
      shop_logo: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue:
          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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

  return User;
};
