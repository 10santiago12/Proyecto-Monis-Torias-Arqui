const express=require("express");
const {z}=require("zod");
const {TutorsService}=require("../services/tutors.service");
const {requireRoles}=require("../middlewares/role.middleware");

const router=express.Router();
const service=new TutorsService();

const codeSchema=z.object({
  note:z.string().default(""),
});

router.post("/codes",requireRoles("manager"),async (req,res,next)=>{
  try {
    const {note}=codeSchema.parse(req.body);
    const r=await service.createTutorCode(req.user.uid,note);
    return res.status(201).json(r);
  } catch (e) {return next(e);}
});

module.exports=router;
