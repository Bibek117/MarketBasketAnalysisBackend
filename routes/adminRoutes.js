import express from 'express';
import adminController from '../controller/adminController.js';
import verifyJWT from "../middleware/verfiyJWT.js";
import checkAdmin from '../middleware/checkAdmin.js';
const router = express.Router();
router.use(verifyJWT);
router.use(checkAdmin);

router.get('/get-all-users',adminController.getAllUsers);
router.get('/populate-dashboard',adminController.populateDashboard);
router.delete('/delete-user/:userId',adminController.deleteUser);

export default router;