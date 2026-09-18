import {Router} from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Portfolio from '../models/Portfolio.js';
import User from '../models/User.js';
import {protect,allow} from '../middleware/auth.js';

const r=Router();
const dir=path.resolve('uploads');
fs.mkdirSync(dir,{recursive:true});

const storage=multer.diskStorage({
 destination:dir,
 filename:(req,file,cb)=>cb(null,Date.now()+'-'+file.originalname.replace(/[^a-zA-Z0-9._-]/g,'_'))
});
const upload=multer({
 storage,
 limits:{fileSize:250*1024*1024},
 fileFilter:(req,file,cb)=>{
   const ok=['video/mp4','video/quicktime','image/jpeg','image/png'].includes(file.mimetype);
   cb(ok?null:new Error('Only MP4, MOV, JPG and PNG files are supported'),ok);
 }
});

r.get('/public',async(req,res)=>{
 try{
  const q={approvalStatus:'approved'};
  if(req.query.category&&req.query.category!=='All')q.category=req.query.category;
  res.json(await Portfolio.find(q).sort({featured:-1,createdAt:-1}).select('-editor'));
 }catch(e){res.status(500).json({message:e.message})}
});

r.get('/editor/:slug',async(req,res)=>{
 try{
  const u=await User.findOne({slug:req.params.slug,role:'editor'}).select('-password');
  if(!u)return res.status(404).json({message:'Editor not found'});
  const works=await Portfolio.find({editor:u._id,approvalStatus:'approved'}).sort({createdAt:-1}).select('-editor');
  res.json({editor:{name:u.name,slug:u.slug,bio:u.bio,skills:u.skills,software:u.software,experience:u.experience,education:u.education},works});
 }catch(e){res.status(500).json({message:e.message})}
});

r.get('/mine',protect,allow('editor'),async(req,res)=>{
 try{res.json(await Portfolio.find({editor:req.user._id}).sort({createdAt:-1}))}
 catch(e){res.status(500).json({message:e.message})}
});

r.post('/',protect,allow('editor'),upload.single('file'),async(req,res)=>{
 if(!req.file)return res.status(400).json({message:'File is required'});
 try{
  const isVideo=req.file.mimetype.startsWith('video/');
  const item=await Portfolio.create({
   editor:req.user._id,title:req.body.title,category:req.body.category,description:req.body.description,
   assetUrl:'/uploads/'+req.file.filename,assetType:isVideo?'video':'image',originalName:req.file.originalname
  });
  res.status(201).json(item);
 }catch(e){
  try{fs.unlinkSync(req.file.path)}catch{}
  res.status(500).json({message:e.message});
 }
});

r.delete('/:id',protect,allow('editor'),async(req,res)=>{
 try{
  const item=await Portfolio.findOneAndDelete({_id:req.params.id,editor:req.user._id});
  if(!item)return res.status(404).json({message:'Not found'});
  try{fs.unlinkSync(path.resolve(item.assetUrl.replace(/^\//,'')))}catch{}
  res.json({ok:true});
 }catch(e){res.status(500).json({message:e.message})}
});

r.use((err,req,res,next)=>{
 if(err instanceof multer.MulterError && err.code==='LIMIT_FILE_SIZE')return res.status(413).json({message:'File is too large. Maximum size is 250 MB.'});
 if(err)return res.status(400).json({message:err.message||'Upload failed'});
 next();
});
export default r;
