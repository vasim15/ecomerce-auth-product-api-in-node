import mongoose from 'mongoose'
import paginate from "mongoose-paginate-v2";

import { APP_URL } from '../config'
const Schema = mongoose.Schema;

const productSchame = new Schema({
    name: {type: String, required: true},
    price: {type: Number, required: true},
    size: {type: String, required: true},
    image: {type: String, required: true, get: (image) => {
        return `${APP_URL}/${image}`
    }}

}, { timestamps: true, toJSON: { getters: true }, id: false ,  toObject: {
      transform: function (doc, ret, game) {
        delete ret.__v;
      }}});
const PaginatePlugin = (schema, options) => {
  options = options || {};
  schema.query.search = async function (params){
      const data = this.model.find({
        ...this.getFilter(),
        name: { $regex: params, $options: "i" },
      });
      return this
  }
  schema.query.paginate = async function (params) {
    const meta = {
      limit: options.limit || 10,
      page: 1,
      count: 0,
    };
    meta.limit = parseInt(params.limit) || meta.limit;
    const page = parseInt(params.page);
    meta.page = page > 0 ? page : meta.page;
    const offset = (meta.page - 1) * meta.limit;

    const [data, count] = await Promise.all([
      this.limit(meta.limit).skip(offset),
      this.model.countDocuments(this.getFilter()),
    ]);
    meta.count = count;
    return { data, meta };
  };
};
productSchame.plugin(PaginatePlugin);

const ProductModel = mongoose.model('Product',productSchame,'products');
export default ProductModel;