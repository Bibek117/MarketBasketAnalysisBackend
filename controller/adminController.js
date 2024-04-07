import AnalysisData from "../models/AnalysisData.js";
import EnergyPurchase from "../models/EnergyPurchase.js";
import User from "../models/User.js"

const adminController = {
    async populateDashboard(req,res){
    
        //total users 
        let userCount = await User.count();
        userCount = userCount-1; //excluding admin

        let totalQuantity = await EnergyPurchase.sum('quantity');
        totalQuantity = totalQuantity - userCount;
        let totalAmount = await EnergyPurchase.sum('amount');
        
        let totalAnalysisPerformed = await AnalysisData.count();

        return res.json({success:true,userCount,totalQuantity,totalAmount,totalAnalysisPerformed});

    },
    async getAllUsers(req,res){
        const users = await User.findAll({where:{role : "user"}});
        return res.json({status:true , users : users});
    },
    async deleteUser(req,res){
        const userId  = req.params.userId;
        const result = await User.destroy({where:{
            id :userId
        }});
        if(result ==  1){
            return res.json({success: true ,message : "User deleted successfully"});
        }else{
            return res.json({success: false , message : "Error deleteing user"});
        }
    }
}

export default adminController;