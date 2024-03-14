import jwt from 'jsonwebtoken';

const verifyJWT = (req,res,next) =>{
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith("Bearer ")){
        return res.json({message : "Unauthorized" , success : false ,status :401});
    }

    const accessToken = authHeader.split(" ")[1];
    //console.log(accessToken)
    jwt.verify(accessToken,process.env.JWT_SECRET_KEY,(err,decoded)=>{
        if(err) return res.json({message : "Forbidden" , success : false ,status : 403});
        req.email = decoded.email;
        req.id = decoded.id;
        next();
    })
}
export default verifyJWT;