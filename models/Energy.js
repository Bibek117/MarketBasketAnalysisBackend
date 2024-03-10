import connection from '../models/index.js';
import { DataTypes } from 'sequelize';

const Energy = connection.define("Energy",{
    energy_id :{
        type : DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey : true,
        allowNull : false,
    },
    energy_count :{
        type : DataTypes.INTEGER,
        allowNull :false,
        defaultValue : 1,
    }
},{
    timestamps : false,
})

export default Energy;