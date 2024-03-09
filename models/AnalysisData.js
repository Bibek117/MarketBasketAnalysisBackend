import { DataTypes } from "sequelize";
import connection from './index.js'

const AnalysisData = connection.define(
  "AnalysisData",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique :true,
    },
    min_support: {
      type: DataTypes.DOUBLE ,
      allowNull: false,
    },
    min_confidence: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    transaction_file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    analysis_done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    analysis_resul_url: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "updatedAt",
  }
);

//AnasisData belongsto

export default AnalysisData