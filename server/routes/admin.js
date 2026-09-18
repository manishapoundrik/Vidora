import {Router} from 'express';
import fs from 'fs';
import path from 'path';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import {protect,allow} from '../middleware/auth.js';

const r=Router();
r.use(protect,allow('admin'));

r.get('/overview',async(req,res)=>res.json({
 editors:await User.countDocuments({role:'editor'}),
 clients:await User.countDocuments({role:'client'}),
 works:await Portfolio.countDocuments(),
 pending:await Portfolio.countDocuments({approvalStatus:'pending'}),
 inquiries:await Inquiry.countDocuments()
}));

r.get('/works',async(req,res)=>res.json(
 await Portfolio.find().populate('editor','name email slug').sort({createdAt:-1})
));

r.patch('/works/:id',async(req,res)=>{
 try{
   const patch={};
   if(req.body.approvalStatus!==undefined)patch.approvalStatus=req.body.approvalStatus;
   if(req.body.featured!==undefined)patch.featured=Boolean(req.body.featured);
   if(patch.approvalStatus==='rejected')patch.featured=false;
   const item=await Portfolio.findByIdAndUpdate(req.params.id,patch,{new:true}).populate('editor','name email slug');
   if(!item)return res.status(404).json({message:'Work not found'});
   res.json(item);
 }catch(e){res.status(500).json({message:e.message})}
});

r.delete('/works/:id',async(req,res)=>{
 try{
   const item=await Portfolio.findByIdAndDelete(req.params.id);
   if(!item)return res.status(404).json({message:'Work not found'});
   if(item.assetUrl){try{fs.unlinkSync(path.resolve(item.assetUrl.replace(/^\//,'')))}catch{}}
   res.json({ok:true});
 }catch(e){res.status(500).json({message:e.message})}
});

r.get('/editors',async(req,res)=>res.json(await User.find({role:'editor'}).select('-password').sort({createdAt:-1})));
r.get('/clients',async(req,res)=>res.json(await User.find({role:'client'}).select('-password').sort({createdAt:-1})));
r.patch('/users/:id/status',async(req,res)=>{
 if(!['active','blocked'].includes(req.body.status))return res.status(400).json({message:'Invalid status'});
 const u=await User.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true}).select('-password');
 if(!u)return res.status(404).json({message:'User not found'});
 res.json(u);
});
r.get('/inquiries',async(req,res)=>res.json(await Inquiry.find().sort({createdAt:-1})));
r.patch('/inquiries/:id',async(req,res)=>{
 if(!['new','contacted','closed'].includes(req.body.status))return res.status(400).json({message:'Invalid inquiry status'});
 const i=await Inquiry.findByIdAndUpdate(req.params.id,{status:req.body.status},{new:true});
 if(!i)return res.status(404).json({message:'Inquiry not found'});
 res.json(i);
});
export default r;
