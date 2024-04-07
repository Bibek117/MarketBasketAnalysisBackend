import User from "../models/User.js"
const checkAdmin =async (req,res,next)=>{
    const email = req.email;
    const user = await User.findOne({where : {email : email}});
    if(user.role === "admin"){
        next();
    }else{
        return res.json({
          message: "Unauthorized",
          success: false,
          status: 401,
        });
    }
}

export default checkAdmin;