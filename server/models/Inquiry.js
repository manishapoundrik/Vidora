import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 client:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
 name:{type:String,required:true},
 email:{type:String,required:true},
 company:String,
 projectTitle:String,
 budget:String,
 requirement:{type:String,required:true},
 status:{type:String,enum:['new','contacted','closed'],default:'new'}
},{timestamps:true});
export default mongoose.model('Inquiry',schema);
