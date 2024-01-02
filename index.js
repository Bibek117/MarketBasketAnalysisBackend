const express= require('express')
const app= express();



app.get('/',(req,res)=>{
    res.send('hello from server')
})


app.listen(5000,(req,res)=>{
    console.log("server started At port 5000")
})