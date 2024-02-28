const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./models")


const app = express();

app.use(express.json());
app.use(cors());


const authRoutes = require('./routes/authRoutes');
app.use('/api/auth',authRoutes);

db.sequelize.sync().then(()=>{
    app.listen(8000,()=>{
        console.log("Server running on port 8000")
    })
})





