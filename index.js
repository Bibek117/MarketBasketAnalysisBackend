import express from "express";
import helmet from "helmet";
import cors from "cors";
import "dotenv/config";
import connection from "./models/index.js";
import cookieParser from "cookie-parser";

//routes
import authRoutes from './routes/authRoutes.js'
import analysisRoutes from './routes/analysisRoutes.js'
import energyRoutes from './routes/energyRoutes.js';
import adminRoutes from './routes/adminRoutes.js'




//import must be always at top whereas require can be anywhere
// const db = require("./models")

const app = express();

//parse json data
app.use(express.json()); 

 //parse form data
app.use(express.urlencoded({ extended: false })); 
app.use(cookieParser());

// allow request from all origins
app.use(
  cors({
    origin: ["http://localhost:3000", "https://rc-epay.esewa.com.np"],  //i think no need to allow as it only send get request
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
); 

//security
app.use(helmet()); 

// making files inside pulci static
app.use(express.static('public'));  


//routes resgistered as middlewares
app.use("/api/auth", authRoutes);
app.use('/api/energy',energyRoutes)
app.use('/api/analysis',analysisRoutes);
app.use('/api/admin',adminRoutes);

//sync({force:true})
let port = process.env.PORT || 8001
app.listen(port, async () => {
    console.log(`Server running on port : ${port}`)
  try {
    await connection.authenticate();
    connection.sync();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});


//allow only specicfic origin
// app.use(
//   cors({
//     origin: ["http://localhost:4000"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   }));

//npm add @types/node -> intellisense for node packages
//app.use(express.static());  to specify which files must be considered static
// express-rate-imiter librabry ddos
//helmet library for security

