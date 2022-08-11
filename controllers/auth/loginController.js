import joi from 'joi';
import bcrypt from 'bcrypt'

import { REFRESH_JWT } from '../../config'
import { UserModel, TokenModel } from "../../models"
import JwtService from '../../services/JwtService'


const loginController = {
      async login(req,res,next){
        const loginSchema = joi.object({
            email: joi.string().email().required(),
            password: joi.string().required(),
        })
        const { error } = loginSchema.validate(req.body)
        if(error){
            return next(error)
        }
        const {email,password} =req.body
        try{
            const user = await UserModel.findOne({ email })
            if(!user){
                return next(CustomErrorHandler.wrongCredencial())
            }

            const match = bcrypt.compare(password,user.password)
            if(!match){
                return next(CustomErrorHandler.wrongCredencial('Wrong Password'))
            }
            const AccessToken = JwtService.sign({_id: user._id, role: user.role})
            const RefreshToken = JwtService.sign({_id: user._id, role: user.role},'1y',REFRESH_JWT)
              await TokenModel.create({token:RefreshToken});
            res.status(200).json({ access_token: AccessToken, refresh_token: RefreshToken});
 
        }catch(err){

            return next(err)
        }

    },
    async logout(req,res,next){
        const refreshSchema = joi.object({
            refresh_token: joi.string().required(),
        })
        const { error } = refreshSchema.validate(req.body)
        if(error){
            return next(error)
        }
        try{
            await TokenModel.deleteOne({token: req.body.refresh_token})
        }catch(err){
            return next(new Error('Somthing Went Wrong on The SERVER'));
        }
        res.status(200).json({status: 1})

    }
}
export default loginController