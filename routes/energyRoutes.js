import express from "express";
import energyController from "../controller/energyController.js";
import verifyJWT from './../middleware/verfiyJWT.js';

const router = express.Router();

router.post("/order-energy",verifyJWT,energyController.orderEnergy);
router.post("/check-energy",verifyJWT,energyController.checkEnergy);
router.get("/esewa-success",energyController.esewaSuccess);

export default router;