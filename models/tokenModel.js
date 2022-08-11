import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const tokenSchame = new Schema({
    token: {type: String, unique: true}
});

const TokenModel = mongoose.model('Token',tokenSchame,'tokens');
export default TokenModel;