import express from 'express';
import authController from '../controller/authController.js'
import multer from 'multer';

//test
import User from '../models/User.js'
import verifyJWT from '../middleware/verfiyJWT.js'

//fileupload
import { fileName, dynamicStorage } from '../services/fileUpload.js';

const basePath = "public/shopLogo";
const storage = dynamicStorage(basePath);
const upload = multer({ storage: storage });

const router =  express.Router()


router.post('/login',authController.login);
router.post('/register',upload.single('shop_logo'),(req,res) => {
    authController.register(req,res,fileName)});
router.post('/logout',authController.logout);

router.get('/verify/:token',authController.verifyToken);

router.get('/refresh',authController.refresh);

//test
router.get('/test',verifyJWT,async (req,res)=>{
  return res.json({success:true , message : "authenticated user"});
})


export default router;