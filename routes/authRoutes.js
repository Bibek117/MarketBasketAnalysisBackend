import express from 'express';
import authController from '../controller/authController.js'
import multer from 'multer';

//test
import User from '../models/User.js'
import verifyJWT from '../middleware/verfiyJWT.js'

const router =  express.Router()
let imageName;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/shopLogo");
  },
  filename: function (req, file, cb) {
    imageName= Date.now() + "-" + Math.round(Math.random() * 1e9) + "-" + file.originalname.trim();
    cb(null,imageName);
  },
});

const upload = multer({ storage: storage });

router.post('/login',authController.login);
router.post('/register',upload.single('shop_logo'),(req,res) => {
    authController.register(req,res,imageName)});
router.post('/logout',authController.logout);

router.get('/verify/:token',authController.verifyToken);

router.get('/refresh',authController.refresh);

//test
router.get('/all',verifyJWT,async (req,res)=>{
  const allUsers = await User.findAll();
  return res.json({allUsers});
})


export default router;