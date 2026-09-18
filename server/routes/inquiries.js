import {Router} from 'express';
import Inquiry from '../models/Inquiry.js';
import User from '../models/User.js';
import {protect} from '../middleware/auth.js';
const r=Router();

r.post('/',async(req,res)=>{
  try{
    const {name,email,company,projectTitle,budget,requirement}=req.body;
    if(!name||!email||!requirement)return res.status(400).json({message:'Name, email and requirement are required'});
    const client=await User.findOne({email:email.toLowerCase()});
    const i=await Inquiry.create({client:client?._id,name,email,company,projectTitle,budget,requirement});
    res.status(201).json(i);
  }catch(e){res.status(500).json({message:e.message})}
});
r.get('/mine',protect,async(req,res)=>{
  if(req.user.role!=='client')return res.status(403).json({message:'Client access required'});
  res.json(await Inquiry.find({client:req.user._id}).sort({createdAt:-1}));
});
export default r;
