import { UserModel } from "../models";
import CustomErrorHandler from "../services/CustomErrorHandler";

const admin = async (req,res,next)=>{
    try{

        const user = await UserModel.findOne({ _id: req.user._id });
        if(user.role == 'admin'){
            return next();
        }else{
            return next(CustomErrorHandler.unAuthorized());
        }

    }catch(err){
        return next(CustomErrorHandler.serverError());

    }
}
export default admin;