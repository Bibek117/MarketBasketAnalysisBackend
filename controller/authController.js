const { User ,sequelize } = require("../models");
const bcrypt = require('bcrypt');
const jwt  =  require('jsonwebtoken')
require('dotenv').config();

const authController = {
  async register(req, res) {
    try {
      const { username, email, password, shop_name, owner_name, address } = req.body;
      const hashedPass = await bcrypt.hash(password,10); //10 salt rounds 
      const user = await sequelize.query('INSERT INTO users (username, email, password, shop_name, owner_name, address) VALUES (?, ?, ?, ?, ?, ?)',{
        replacements :[username,email,hashedPass,shop_name,owner_name,address],
        type : sequelize.QueryTypes.INSERT,
      });
      return res.status(201).json({message : 'User created successfully'});
    } catch (error) {
        if (
          error.name === "SequelizeUniqueConstraintError" &&
          error.fields.username &&
          error.fields.username.includes("unique_username_constraint_name")
        ) {
          res
            .status(400)
            .json({ message: "User with this username already exists" });
        } else if (
          error.name === "SequelizeUniqueConstraintError" &&
          error.fields.email &&
          error.fields.email.includes("unique_email_constraint_name")
        ) {
          res
            .status(400)
            .json({ message: "User with this email already exists" });
        } else {
          console.error(error);
          res.status(500).json({ message: "Failed to register user" });
        }
    }
  },

  async login(req, res) {
    try{
        const {email,password} = req.body;
        const user = await sequelize.query(
          "SELECT id, email, password from users WHERE email = ?",
          {
            replacements: [email],
            type: sequelize.QueryTypes.SELECT,
            model: User,
            mapToModel: true,
          }
        );
        if(!user ){
            return res.status(404).json({message: 'User not found'});
        }
        // console.log(password)
        // console.log(user[0].password)
        
        const validPass = await bcrypt.compare(password,user[0].password);

        if(!validPass){
            return res.status(401).json({message : "Invalid email or password"});
        }
        const token = jwt.sign(
          { email: user.email, username: user.username },
          process.env.JWT_SECRET_KEY
        );

        res.cookie('token',token,{httpOnly : true});  //httpOnly :true means only can be access by server preventing xss
        return res.status(200).json({message:"Authentication successful"});

    }catch(error){
        console.log(error);
        return res.status(500).json({message:"Failed to authenticate user"});
    }  
  },
};

module.exports = authController;
