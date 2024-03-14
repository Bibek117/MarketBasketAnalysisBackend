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
      // console.log(userId)
      if (
        title == null ||
        min_confidence == null ||
        min_support == null ||
        userId == null
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
      formData.append("file", blobData, req.file.originalname);

      await axios
        .post("http://127.0.0.1:5000/upload-csv", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then(async (response) => {
          //console.log(response.data)
          let resultData = JSON.stringify(response.data);

          const filename = `${
            req.file.originalname
          }${Date.now()}${userId}.json`;
          fs.writeFileSync(`public/results/${filename}`, resultData);

          await AnalysisData.update(
            { analysis_resul_url: filename, analysis_done: true },
            { where: { userId: userId, title: title } }
          );

          const energyData = await Energy.findOne({
            where: { UserId: userId },
          });
          let energyTrack = energyData.energy_count - 1;
          await Energy.update(
            { energy_count: energyTrack },
            { where: { UserId: userId } }
          );
          return res.status(200).json({
            success: true,
            message: "Analysis performed successfully",
            result: resultData,
            energy_count: energyTrack,
          });
        })
        .catch((error) => {
          return res.json({
            success: false,
            message: "Something went wrong",
            error: error.message,
          });
        });
    } catch (err) {
      console.log(err.errors);
      return res.json({
        success: false,
        error: err.errors || "Something went wrong",
      });
    }
  },
  async getAllAnalysis(req, res) {
    try {
      const { userId } = req.params;
      const allData = await AnalysisData.findAll({
        where: { UserId: userId, analysis_done: true },
      });
      if (allData.length === 0) {
        return res.json({ success: false, message: "No past analysis data" });
      }
      res.json({ success: true, historyData: allData.reverse() });
    } catch (err) {
      console.log(err);
    }
  },

  async getSingleData(req, res) {
    try {
      const { dataId } = req.params;
      const singleData = await AnalysisData.findOne({ where: { id: dataId } });
      const { analysis_resul_url, title, min_support, min_confidence } =
        singleData;
      fs.readFile(
        `public/results/${analysis_resul_url}`,
        "utf8",
        (err, data) => {
          if (err) {
            console.error(err);
            res.status(500).json({ message: "Failed to read data file" });
            return;
          }
          return res.json({
            data,
            title,
            min_support,
            min_confidence,
            success: true,
          });
        }
      );
    } catch (err) {
      console.log(err);
    }
  },

  async delete(req, res) {
    try {
      const { dataId } = req.params;
      const data = await AnalysisData.findOne({ where: { id: dataId } });

      await fs.promises.unlink(`public/results/${data.analysis_resul_url}`);
      console.log("Analysis result file deleted successfully");

      await fs.promises.unlink(`public/data/${data.transaction_file_url}`);
      console.log("Transaction file deleted successfully");

      await AnalysisData.destroy({ where: { id: dataId } });
      console.log("Data record deleted successfully");

      return res.json({ success: true, message: "Data deleted successfully" });
    } catch (err) {
      console.error("Error deleting data:", err);
      return res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while deleting data",
        });
    }
  },
};


export default analysisController;
