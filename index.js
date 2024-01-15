const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const User = require("./model/userModel");
require('dotenv').config();
const app = express();

app.use(bodyParser.json());
app.use(cors());
// Connect to MongoDB
// const dbURI =
//   "mongodb+srv://bikrambhattarai296:BZedWPdlJPQFVJkn@cluster0.npfxkiq.mongodb.net/marketbasket?retryWrites=true&w=majority";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.dbURI, {});
    console.log("CONNECTED TO DATABASE SUCCESSFULLY");
  } catch (error) {
    console.error("COULD NOT CONNECT TO DATABASE:", error.message);
  }
};

//routes
app.get("/", (req, res) => {
  res.send("hello from server");
});
// post register
app.post('/register', async (req, res) => {
  try {
      const { email, username, password } = req.body
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = new User({ email, username, password: hashedPassword })
      await newUser.save()
      res.status(201).json({ message: 'User created successfully' })
  } catch (error) {
      res.status(500).json({ error: 'Error signing up' })
  }
})

///get registereed users
app.get('/register', async (req, res) => {
  try {
      const users = await User.find()
      res.status(201).json(users)
      
  } catch (error) {
      res.status(500).json({ error: 'Unable to get users' })
  }
})
app.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body
      const user = await User.findOne({ username })
      if (!user) {
          return res.status(401).json({ error: 'Invalid credentials'})
      }
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if(!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid credentials' })
      }
      //jwt
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1hr' })
      res.json({ message: 'Login successful' })
  } catch (error) {
      res.status(500).json(error)
  }
})

const startServer = async () => {
  await connectToDatabase();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port  ${PORT}`);
  });
};
startServer();
