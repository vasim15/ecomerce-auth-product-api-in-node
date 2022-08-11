import joi from 'joi';
import bcrypt, { hash } from 'bcrypt';


import { TokenModel, UserModel } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler'
import JwtService from '../../services/JwtService'
import { REFRESH_JWT } from '../../config';


const registerController = {
    async register(req,res,next){

        const registerSchema = joi.object({
            name: joi.string().min(3).max(30).required(),
            email: joi.string().email().required(),
            password: joi.string().required(),
            repeat_password: joi.ref('password')

        })
        const { name, email, password } = req.body; 
        console.log(req.body);
        const { error } = registerSchema.validate(req.body);
        if (error){
            return next(error)
        }
        try{
            const exist = await UserModel.exists({email: email});
            if(exist){
                return next(CustomErrorHandler.alreadyExist('User Already Exist'));
            }
        }catch(err){
            return next(err);
        }
        let AccessToken;
        let RefreshToken
        try{
            const hashPassword = await bcrypt.hash(password,10);
            const user = new UserModel({
            name,email,password:hashPassword
            })
           const result = await user.save();
           AccessToken = JwtService.sign({ _id: result._id, role: result.role})
           RefreshToken = JwtService.sign({_id: result._id, role: result.role},'1y',REFRESH_JWT)
           await TokenModel.create({token:RefreshToken});

        }catch(err){
            return next(err);

        }
        res.status(201).json({ access_token: AccessToken, refresh_token: RefreshToken })

    }
}
export default registerController;