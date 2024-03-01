import express from 'express';
const router =  express.Router();
import authController from '../controller/authController.js'

router.post('/login',authController.login);
router.post('/register',authController.register);
router.get('/verify/:token',authController.verifyToken);


export default router;