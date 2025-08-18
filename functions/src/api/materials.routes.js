const express=require("express");
const {z}=require("zod");
const {MaterialsService}=require("../services/materials.service");

const router=express.Router();
const service=new MaterialsService();

const upSchema=z.object({
  sessionId:z.string().min(1),
  filename:z.string().min(1),
});

router.post("/upload-url",async (req,res,next)=>{
  try {
    const r=await service.requestUpload(req.user,upSchema.parse(req.body));
    return res.status(201).json(r);
  } catch (e) {return next(e);}
});

router.get("/:id/download-url",async (req,res,next)=>{
  try {
    const r=await service.getDownloadUrl(req.params.id);
    return res.json(r);
  } catch (e) {return next(e);}
});

module.exports=router;
