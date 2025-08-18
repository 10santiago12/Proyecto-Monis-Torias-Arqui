const express=require("express");
const {z}=require("zod");
const {SessionsService}=require("../services/sessions.service");
const {requireRoles}=require("../middlewares/role.middleware");

const router=express.Router();
const service=new SessionsService();

const requestSchema=z.object({
  tutorCode:z.string().min(4),
  topic:z.string().min(3),
  description:z.string().default(""),
  durationMin:z.number().int().positive(),
  preferredAt:z.string().optional(), // ISO opcional
  currency:z.string().default("COP"),
  price:z.number().int().positive().optional(),
  hourlyRate:z.number().int().positive().optional(),
});

router.post("/request",async(req,res,next)=>{
  try{
    const dto=requestSchema.parse(req.body);
    const r=await service.requestSession(req.user,dto);
    return res.status(201).json(r);
  }catch(e){return next(e);}
});

const confirmSchema=z.object({
  scheduledAt:z.string().min(10), // ISO
});

router.post("/:id/confirm",requireRoles("tutor"),async(req,res,next)=>{
  try{
    const dto=confirmSchema.parse(req.body);
    const r=await service.confirmByTutor(req.user,req.params.id,dto);
    return res.json(r);
  }catch(e){return next(e);}
});

router.post("/:id/mark-done",async(req,res,next)=>{
  try{
    const r=await service.markDoneByStudent(req.user,req.params.id);
    return res.json(r);
  }catch(e){return next(e);}
});

router.get("/:id",async(req,res,next)=>{
  try{
    const s=await service.getById(req.params.id);
    if(!s)return res.status(404).json({message:"Not found"});
    return res.json(s);
  }catch(e){return next(e);}
});

module.exports=router;
