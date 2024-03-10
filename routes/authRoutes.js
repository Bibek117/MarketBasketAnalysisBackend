import express from 'express';
import authController from '../controller/authController.js'


//test
import User from '../models/User.js'
import verifyJWT from '../middleware/verfiyJWT.js'


const router =  express.Router()


router.post('/login',authController.login);
router.post('/register',(req,res) => {
    authController.register(req,res)});
router.post('/logout',authController.logout);

router.get('/verify/:token',authController.verifyToken);

router.get('/refresh',authController.refresh);

//test
router.get('/test',verifyJWT,async (req,res)=>{
  return res.json({success:true , message : "authenticated user"});
})


export default router;