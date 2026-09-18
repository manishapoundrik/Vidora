import mongoose from 'mongoose';
const schema=new mongoose.Schema({editor:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},title:{type:String,required:true},category:String,description:String,assetUrl:String,assetType:{type:String,enum:['video','image'],required:true},originalName:String,approvalStatus:{type:String,enum:['pending','approved','rejected'],default:'pending'},featured:{type:Boolean,default:false}},{timestamps:true});
export default mongoose.model('Portfolio',schema);
