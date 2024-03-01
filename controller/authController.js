import User from '../models/User.js';
import connection from '../models/index.js';
import  bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from '../services/sendMail.js'
import { QueryTypes } from 'sequelize';

const secretKey = process.env.JWT_SECRET_KEY;

const authController = {
  async register(req, res) {
    try {
      const { username, email, password, shop_name, owner_name, address } = req.body;
      const hashedPass = await bcrypt.hash(password, 10); //10 salt rounds

      const verificationToken = jwt.sign({ email }, secretKey, {
        expiresIn: "1D",
      });

      const user = await connection.query(
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
      const mailData = {
        recepEmail: email,
        subject: "Email verification link",
        html: `<p>Please click <a href="http://localhost:8000/api/auth/verify/${verificationToken}">here</a> to verify your email address.</p>`,
      };

      sendMail(mailData)
        .then((response) => {
          return res
            .status(201)
            .json({
              message:
                "User created successfully. Please verify your mail before logging in. Email has been sent to your mail",
            });
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json(err);
        });
    } catch (error) {
      console.log(error)
     return res.json({success : "fail" ,message :error.message})
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await connection.query(
        "SELECT * from users WHERE email = ?",
        {
          replacements: [email],
          type: QueryTypes.SELECT,
          model: User,
          mapToModel: true,
        }
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // console.log(password)
      // console.log(user[0].password)

      const validPass = await bcrypt.compare(password, user[0].password);

      if (!validPass) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user[0].isVerified == false) {
        const verificationToken = jwt.sign({ email }, secretKey, {
          expiresIn: "1D",
        });
        const mailData = {
          recepEmail: email,
          subject: "Email verification link",
          html: `<p>Please click <a href="http://localhost:8000/api/auth/verify/${verificationToken}">here</a> to verify your email address.</p>`,
        };
        sendMail(mailData)
          .then((response) => {
            return res.status(500).json({
              message:
                "Please verify your mail before logging in. Email has been sent to your mail",
            });
          })
          .catch((err) => {
            console.log(err);
            return res.status(500).json(err);
          });
      } else {
        const token = jwt.sign(
          { email: user.email, username: user.username },
          secretKey
        );
        res.cookie("token", token, { httpOnly: true }); //httpOnly :true means only can be access by server preventing xss
        return res.status(200).json({ message: "Authentication successful" });
      }

    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Failed to authenticate user" });
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

      return res.status(200).json({ message: "Email verified successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Couldnot verify user email" });
    }
  },
};

export default authController;
