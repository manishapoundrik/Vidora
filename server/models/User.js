import mongoose from 'mongoose';
const schema=new mongoose.Schema({name:{type:String,required:true},email:{type:String,required:true,unique:true,lowercase:true},password:{type:String,required:true},role:{type:String,enum:['editor','client','admin'],required:true},status:{type:String,enum:['active','blocked','pending'],default:'active'},education:String,skills:[String],software:[String],experience:String,bio:String,slug:{type:String,unique:true,sparse:true}},{timestamps:true});
export default mongoose.model('User',schema);
