import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {protect} from '../middleware/auth.js';

const r=Router();
const sign=u=>jwt.sign({id:u._id,role:u.role},process.env.JWT_SECRET,{expiresIn:'7d'});
const slugify=s=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

r.post('/register',async(req,res)=>{
 try{
  const {name,email,password,role='client'}=req.body;
  if(!name||!email||!password||!['editor','client'].includes(role))return res.status(400).json({message:'Name, email, password and valid role are required'});
  if(await User.findOne({email}))return res.status(409).json({message:'Email already registered'});
  let final;
  if(role==='editor'){
   const base=slugify(name)||'editor'; final=base; let i=1;
   while(await User.findOne({slug:final}))final=`${base}-${i++}`;
  }
  const u=await User.create({name,email,password:await bcrypt.hash(password,12),role,slug:role==='editor'?final:undefined,status:'active'});
  res.status(201).json({token:sign(u),user:{id:u._id,name:u.name,email:u.email,role:u.role,slug:u.slug}});
 }catch(e){res.status(500).json({message:e.message})}
});

r.post('/login',async(req,res)=>{
 try{
  const {email,password}=req.body;const u=await User.findOne({email});
  if(!u||!(await bcrypt.compare(password,u.password)))return res.status(401).json({message:'Invalid email or password'});
  if(u.status==='blocked')return res.status(403).json({message:'Account blocked'});
  res.json({token:sign(u),user:{id:u._id,name:u.name,email:u.email,role:u.role,slug:u.slug}});
 }catch(e){res.status(500).json({message:e.message})}
});

r.get('/me',protect,(req,res)=>res.json({user:req.user}));

r.patch('/profile',protect,async(req,res)=>{
 try{
  const allowed=['name','education','skills','software','experience','bio'];const patch={};
  for(const k of allowed)if(req.body[k]!==undefined)patch[k]=req.body[k];
  if(req.user.role==='editor'&&req.body.name&&req.body.name!==req.user.name){
   const base=slugify(req.body.name)||'editor';let final=base,i=1;
   while(await User.findOne({slug:final,_id:{$ne:req.user._id}}))final=`${base}-${i++}`;
   patch.slug=final;
  }
  const u=await User.findByIdAndUpdate(req.user._id,patch,{new:true}).select('-password');
  res.json({user:u});
 }catch(e){res.status(500).json({message:e.message})}
});
export default r;
