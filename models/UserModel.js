import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const userSchame = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, default: 'customer'}

}, { timestamps: true });

const UserModel = mongoose.model('User',userSchame,'users');
export default UserModel;