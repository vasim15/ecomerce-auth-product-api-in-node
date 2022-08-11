import joi from 'joi'

const productSchama = joi.object({
    name: joi.string().required(),
    price: joi.string().required(),
    size: joi.string().required(),
    image: joi.string()
 })
 export default productSchama;