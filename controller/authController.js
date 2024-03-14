import User from "../models/User.js";
import Energy from "../models/Energy.js";
import connection from "../models/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from "../services/sendMail.js";
import { QueryTypes } from "sequelize";
import viewsPath from "../views/filesUrl.js";
import "dotenv/config";

const secretKey = process.env.JWT_SECRET_KEY;
const refreshSecretKey = process.env.REFRESH_TOKEN_SECRET;

const authController = {
  async register(req, res) {
    try {
      const { username, email, password, shop_name, owner_name, address } =
        req.body;

        if (
          username == null ||
          email == null ||
          password == null ||
          shop_name == null ||
          owner_name == null || 
          address == null
        ) {
          return res.json({
            success: false,
            message: "All fields are mandotory",
          });
        }
        const uniqueCheck = await User.findOne({where: { email : email}})
        if(uniqueCheck){
          res.json({success : false , message : "Email already used !Please use a unique email"});
          return;
        }
      const hashedPass = await bcrypt.hash(password, 10); //10 salt rounds

      const verificationToken = jwt.sign({ email }, secretKey, {
        expiresIn: "1D",
      });

      await connection.query(
        "INSERT INTO users (username, email, password, shop_name, owner_name, address) VALUES (?, ?, ?, ?, ?, ?)",
        {
          replacements: [
            username,
            email,
            hashedPass,
            shop_name,
            owner_name,
            address,
          ],
          type: QueryTypes.INSERT,
        }
      );
      const user = await User.findOne({where :{email : email}})

      const userID = user.id;
     // console.log(userID)
      await Energy.create({ UserId: userID });

      const mailData = {
        recepEmail: email,
        subject: "Email verification link",
        html: `<h3>Please click <a href="http://localhost:8000/api/auth/verify/${verificationToken}">here</a> to verify your email address.</h3>`,
      };

      sendMail(mailData)
        .then((response) => {
          return res.status(201).json({
            success: true,
            message:
              "User created successfully. Please verify your mail before logging in. Email has been sent to your mail",
          });
        })
        .catch((err) => {
          console.log(err);
          return res
            .status(500)
            .json({ success: false, message: "Error sending mail" });
        });
    } catch (error) {
      console.log(error);
      return res.json({ success: false, message: "Something went wrong" }); 
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const users = await User.findAll({where : {
        email : email,
      },
      include : Energy
    })
      // console.log(users.length)
      if (users.length == 0) {
        return res.json({ success: false, message: "User not found" });
      }

      const user = users[0];
     
      // console.log(password)
      // console.log(user[0].password)

      const validPass = await bcrypt.compare(password, user.password);

      if (!validPass) {
        return res.json({ success: false, message: "Invalid email or password" });
      }

      if (user.isVerified == false) {
        const verificationToken = jwt.sign({ email }, secretKey, {
          expiresIn: "1D",
        });
        const mailData = {
          recepEmail: email,
          subject: "Email verification link",
          html: `<h3>Please click <a href="http://localhost:8000/api/auth/verify/${verificationToken}">here</a> to verify your email address.</h3>`,
        };
        sendMail(mailData)
          .then((response) => {
            return res.status(500).json({
              success: false,
              message:
                "Please verify your mail before logging in. Email has been sent to your mail",
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).json({ success: false, message: err });
          });
      } else {
        const accessToken = jwt.sign(
          { email: user.email, id: user.id },
          secretKey,
          { expiresIn: "5h" }
        );
        const refreshT = jwt.sign({ email: user.email },refreshSecretKey, {
          expiresIn: "7D",
        });
        res.cookie("refreshToken", refreshT, {
          httpOnly: true,
          maxAge: 7 * 24 * 60 * 60 * 1000, //7days
          // path :"/"
          // sameSite: "none",
        }); //httpOnly :true means only can be access by server preventing xss

        
       // console.log(user.dataValues);
        const {password,...rest} = user.dataValues;
        return res
          .status(200)
          .json({
            success: true,
            message: "Authentication successful",
            accessToken,
            authUser : rest,
          });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ successs: false, message: "Failed to authenticate user" });
    }
  },

  async verifyToken(req, res) {
    try {
      const token = req.params.token;
      if (!token) {
        return res.status(500).json({ message: "No verification token" });
      }
      const decoded = jwt.verify(token, secretKey);
      const userMail = decoded.email;

      await User.update({ isVerified: true }, { where: { email: userMail } });
      return res.sendFile(viewsPath + "/mailverified.html");
    } catch (err) {
      console.log(err);
      return res.sendFile(viewsPath + "/errormailVerification.html");
    }
  },

  async refresh(req, res) {
    try {
      const cookie = req.cookies;
      if (!cookie?.refreshToken)
        return res.status(401).json({ message: "Unauthorized !" });
      const rtoken = cookie.refreshToken;
      console.log(rtoken)
      const decoded =  jwt.verify(rtoken,refreshSecretKey);
      console.log(decoded.email)
     const foundUser = await User.findOne({ where: { email: decoded.email } });
      if (!foundUser) return res.status(401).json({ message: "Unauthorized!" });

      const accessToken = jwt.sign(
        { email: foundUser.email, id: foundUser.id },
        secretKey,
        { expiresIn: "5h" }
      );
      return res.json({ accessToken });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async logout(req, res) {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) return res.sendStatus(204); //no content
    res.clearCookie("refreshToken", { sameSite: "none", httpOnly: true });
    res.json({ message: "Cookie cleared successfully" });
  },
};

export default authController;
