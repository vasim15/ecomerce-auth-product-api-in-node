import joi from 'joi'
import { REFRESH_JWT } from '../../config'
import { TokenModel, UserModel } from '../../models'
import CustomErrorHandler from '../../services/CustomErrorHandler'
import JwtService from '../../services/JwtService'

const refreshController = {
   async refresh(req,res,next){
        const refreshSchema = joi.object({
            refresh_token: joi.string().required(),
        })
        const { error } = refreshSchema.validate(req.body)
        if(error){
            return next(error)
        }
        let refreshToken;
        try{
        refreshToken = await TokenModel.findOne({token: req.body.refresh_token})
        if(!refreshToken){
            return next(CustomErrorHandler.unAuthorized('Invailid Token'))
        }
        let user_id; 
           try{
            const {_id } = await JwtService.verify(refreshToken.token,REFRESH_JWT);
            user_id = _id;
            }catch(err){
                return next(CustomErrorHandler.unAuthorized('Invalid Token'))
            }
            const user = UserModel.findOne({_id: user_id})
            if(!user){
                return next(CustomErrorHandler.unAuthorized('No User Found'))
            }

            const AccessToken = JwtService.sign({_id: user._id, role: user.role})
            const RefreshToken = JwtService.sign({_id: user._id, role: user.role},'1y',REFRESH_JWT)
              await TokenModel.create({token:RefreshToken});
            res.status(200).json({ access_token: AccessToken, refresh_token: RefreshToken});
            
        }catch(err){
            return next(new Error("some thing went wrong "+ err.message))
        }

    }
}
export default refreshController