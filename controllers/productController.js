import { ProductModel } from '../models'
import path from 'path';
import joi from 'joi';
import multer from 'multer';
import CustomErrorHandler from '../services/CustomErrorHandler';
import fs from 'fs';
import productSchama from '../velidaters/productSchema'

        const storage = multer.diskStorage({
            destination: (req,file,cb)=>cb(null,'uploads/'),
            filename: (req,file,cb) => {
                const uniqueName = `${Date.now()}-${Math.round(
                    Math.random() * 1e9
                )}${path.extname(file.originalname)}`;
                cb(null, uniqueName);
            }
        });
        const handleMultipartData = multer({ storage, limits:{fileSize: 1000000 * 5}}).single('image')
       
    
    const productController = {
            async store(req,res,next){
                handleMultipartData(req,res,async (err)=>{
                   if(err){
                       return next(CustomErrorHandler.serverError(err.message))
                   }
                
                const filepath = req.file.path
                
                const { error } = productSchama.validate(req.body);
                if(error){
                   fs.unlink(`${appRoot}/${filepath}`, (err) => {
                        if(err){
                            return next(CustomErrorHandler.serverError(err));
                        }
                   });
                   return next(error);
                }
                const { name, price, size } = req.body;
                let document;
                try{
                    document = await ProductModel.create({
                    name,
                    price,
                    size,
                    image: filepath,
                   })
                } catch (err){
                   return next(err);
                }
            res.status(201).json(document);
        });
    },
     update(req,res,next){
        handleMultipartData(req,res,async (err)=>{
            if(err){
                return next(CustomErrorHandler.serverError(err.message))
            }
         
         let filepath;
         if (req.file.path){
            filepath = req.file.path;
         }
         
         const { error } = productSchama.validate(req.body);
         if(error){
             if(req.file){
                fs.unlink(`${appRoot}/${filepath}`, (err) => {
                    if(err){
                        return next(CustomErrorHandler.serverError(err));
                    }
               });
             }
            
            return next(error);
         }
         const { name, price, size } = req.body;
         let document;
         try{
             document = await ProductModel.findOneAndUpdate({ _id: req.params.id }, {
             name,
             price,
             size,
             ...(req.file && {image: filepath}),
            },{ new: true })
         } catch (err){
            return next(err);
         }
     cccres.status(201).json(document);
 });
},
async destroy(req,res,next){
    try{
        const document = await findOneAndRemove({ _id: req.params.id })
        if(!document){
            return next(new Error('Nothing To Delete'));
        }
        const imagepath = document._doc.image;
        fs.unlink(`${appRoot}/${imagepath}`,(err)=>{
            if(err){
                return(CustomErrorHandler.serverError());
            }
        });
        res.json(document);

    }catch(err){
      next(err)
    }
},

  async index(req,res,next){
      let documents;
      const options = {
        page: 1,
        limit: 10,
        collation: {
          locale: "en",
        },
      };
      try{
        documents = await ProductModel.paginate(
          {},
          options,
        ).select('name')
      }catch(err){
         return next(err)
      }
      return res.json(documents);
  },
  async show(req,res,next){
    let document;
    try{
      document = await ProductModel.find({_id: req.params.id }).select('-updatedAt -__v');
    }catch(err){
       return next(CustomErrorHandler.serverError());
    }
    return res.json(document);

  }
}

export default productController