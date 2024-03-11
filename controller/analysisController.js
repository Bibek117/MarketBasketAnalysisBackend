import AnalysisData from "../models/AnalysisData.js";
import Energy from "../models/Energy.js";
import connection from "../models/index.js";
import axios from "axios";
import fs from "fs";
import { QueryTypes } from "sequelize";

const analysisController = {
  async dataUpload(req, res, fileName) {
    try {
      const { title, min_support, min_confidence, userId } = req.body;
      console.log(userId)
      if (
        title == "" ||
        min_confidence == "" ||
        min_support == "" ||
        userId == ""
      ) {
        return res.json({
          success: false,
          message: "All fields are mandotory",
        });
      }
      const transactionData = await connection.query(
        "INSERT INTO analysisdata (title,min_support,min_confidence, transaction_file_url,UserId) VALUES (?, ?, ?, ?, ?)",
        {
          replacements: [title, min_support, min_confidence, fileName, userId],
          type: QueryTypes.INSERT,
        }
      );    
       const fileData = fs.readFileSync(req.file.path);
       const blobData = new Blob([fileData], { type: "text/csv" });

      const formData = new FormData();
      formData.append("support_threshold", min_support);
      formData.append("confidence_threshold", min_confidence);
      formData.append("file", blobData,  req.file.originalname,
       );

      await axios
        .post("http://127.0.0.1:5000/upload-csv", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(async (response) => {
          //console.log(response.data)
         let resultData = JSON.stringify(response.data);

          const filename = `${ req.file.originalname}${Date.now()}${userId}.json`;
          fs.writeFileSync(`public/results/${filename}`, resultData);

          await AnalysisData.update(
            { analysis_resul_url: filename, analysis_done: true },
            { where: {userId : userId,title : title}}
          );

          const energyData = await Energy.findOne({where :{UserId : userId}});
         let energyTrack = energyData.energy_count - 1;
         await Energy.update({energy_count : energyTrack},{where :{UserId : userId}});
          return res.status(200).json({
            success: true,
            message: "Analysis performed successfully",
            result: resultData,
            energy_count : energyTrack
          });
        })
        .catch((error) => {
          return res.json({
            success: false,
            message: "Something went wrong",
            err: error.message,
          });
        });
    } catch (err) {
      // console.log(err)
      return res.status(500).json({ success: false ,message : err?.errors || "Something went wrong"})
    }
  },
};

export default analysisController;
