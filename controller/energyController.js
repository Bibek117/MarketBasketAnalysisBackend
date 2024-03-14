import EnergyPurchase from "../models/EnergyPurchase.js";
import User from "../models/User.js";
import Energy from "../models/Energy.js";
import generateSign from "../services/generateSignature.js";
import { unitEnergyPrice } from "../constants/constants.js";
import { v4 as uuidv4 } from "uuid";


const energyController = {
  async orderEnergy(req, res) {
    const t_uuid = uuidv4();
    try {
      const { quantity, userId} = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }
      //tax service charge all are zero by default here so no need to calculate more
      const totalCost = quantity * unitEnergyPrice;
      const energyOrder = await EnergyPurchase.create({
        quantity: quantity,
        amount: totalCost,
        transaction_uuid : t_uuid,
        UserId: userId,
      });
      const msg = `total_amount=${energyOrder.amount},transaction_uuid=${t_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE}`;
      const sign = generateSign(msg);
      const formData = {
        amount: energyOrder.amount,
        failure_url: `${process.env.CLIENT_URL}/esewa-payment-error`,
        product_delivery_charge: "0",
        product_service_charge: "0",
        product_code: process.env.ESEWA_PRODUCT_CODE,
        signature: sign,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        success_url: `${process.env.SERVER_URL}/api/energy/esewa-success`,
        tax_amount: "0",
        total_amount: energyOrder.amount,
        transaction_uuid: t_uuid,
      };

      res.json({
        success: true,
        message: "Order created successfully",
        order: energyOrder,
        formData,
      });
    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: err?.message || "Something went wrong",
      });
    }
  },

  async esewaSuccess(req, res) {
    try {
      const { data } = req.query;
      const decodedData = JSON.parse(
        Buffer.from(data, "base64").toString("utf-8")
      );
      console.log(decodedData);

      if (decodedData.status !== "COMPLETE") {
        return res.redirect(`${process.env.CLIENT_URL}/esewa-payment-error`);
      }
      const message = decodedData.signed_field_names
        .split(",")
        .map((field) => `${field}=${decodedData[field] || ""}`)
        .join(",");
      //console.log(message);
      const signature = generateSign(message);

      if (signature !== decodedData.signature) {
        return res.redirect(`${process.env.CLIENT_URL}/esewa-payment-error`);
      }
    await EnergyPurchase.update({payment_status : "completed", transaction_code : decodedData.transaction_code},{
        where: {
          transaction_uuid : decodedData.transaction_uuid,
        }
      })
      const latestTrans = await EnergyPurchase.findOne({
        where: { transaction_uuid: decodedData.transaction_uuid },
        include: User,
      });
      
     const user = latestTrans.dataValues.User.dataValues;
    console.log(user);

      const energy = await Energy.findOne({where : {UserId: user.id}});
      const totalEnergy = energy.energy_count + latestTrans.quantity;
      await Energy.update({energy_count : totalEnergy},{where : {
        UserId : user.id
      }})


      return res.redirect(`${process.env.CLIENT_URL}/home`);
    } catch (err) {
      console.log(err);
      return res.redirect(`${process.env.CLIENT_URL}/esewa-payment-error`);
    }
  },
   async checkEnergy(req,res){
    try{
        const {userId} = req.body;
    const data = await Energy.findOne({where : {UserId : userId}});
    if(data?.energy_count > 0){
        return res.json({success:true})
    }else{
        return res.json({success:false,message : "You dont have enough energy to perfom MBA !Please buy energy"})
    } 
    }catch(err){
       return res.json({
         success: false,
         message:
           err?.message || "Something went wrong",
       }); 
    }
   
}

};

export default energyController;
