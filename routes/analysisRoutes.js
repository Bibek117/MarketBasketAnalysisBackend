import express from 'express';
import analysisController from '../controller/analysisController.js'
import { dynamicStorage,fileName } from '../services/fileUpload.js';
import multer from 'multer'
import verifyJWT from '../middleware/verfiyJWT.js';


const router = express.Router();

router.use(verifyJWT);
const basePath = "public/data";
const storage = dynamicStorage(basePath);
const upload = multer({ storage: storage });


router.post('/upload',upload.single('dfile'),(req,res)=>{
    analysisController.dataUpload(req,res,fileName)
});

router.get('/totalAnalysis/:userId',analysisController.totalAnalysis);
router.post('/ecom',analysisController.performEcom);
router.get("/allAnalysis/:userId",analysisController.getAllAnalysis);
router.get("/singleAnalysisResult/:dataId",analysisController.getSingleData);
router.delete("/delete/:dataId",analysisController.delete);


export default router;