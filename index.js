import express from "express";
import helmet from "helmet";
import cors from "cors";
import "dotenv/config";
import connection from "./models/index.js";
import authRoutes from './routes/authRoutes.js'

//import must be always at top whereas require can be anywhere
// const db = require("./models")

const app = express();

app.use(express.json()); //parse json dats
app.use(express.urlencoded({ extended: false })); //parse form data
app.use(cors());
app.use(helmet()); //security


app.use("/api/auth", authRoutes);

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

//everydaykarma project part2 for image hanldling

//npm add @types/node -> intellisense for node packages
//app.use(express.static());  to specify which files must be considered static
// express-rate-imiter librabry ddos
//helmet library for security
