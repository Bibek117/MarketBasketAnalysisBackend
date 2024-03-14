import express from 'express';
import authController from '../controller/authController.js'


//test
import User from '../models/User.js'
import Energy from '../models/Energy.js';
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
  const energyData = await Energy.findOne({where:{UserId : req.id}})
  return res.json({success:true , message : "authenticated user", energyCount : energyData.energy_count});
})


export default router;