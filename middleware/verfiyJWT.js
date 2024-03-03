import jwt from 'jsonwebtoken';

const verifyJWT = (req,res,next) =>{
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith("Bearer ")){
        return res.status(401).json({message : "Unauthorized"});
    }

    const accessToken = authHeader.split(" ")[1];
    console.log(accessToken)
    jwt.verify(accessToken,process.env.JWT_SECRET_KEY,(err,decoded)=>{
        if(err) return res.status(403).json({message : "Forbidden"});
        req.email = decoded.email;
        next();
    })
}
export default verifyJWT;