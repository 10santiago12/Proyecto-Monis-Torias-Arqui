const express=require("express");
const {z}=require("zod");
const {UsersService}=require("../services/users.service");
const {requireRoles}=require("../middlewares/role.middleware");

const router=express.Router();
const service=new UsersService();

// Inicializa rol por defecto estudiante (idempotente)
router.post("/bootstrap",async (req,res,next)=>{
  try {
    const r=await service.ensureStudent(req.user.uid);
    return res.json(r);
  } catch (e) {return next(e);}
});

// Elevar a tutor con código
const tutorSchema=z.object({code:z.string().min(4)});
router.post("/upgrade-to-tutor",async (req,res,next)=>{
  try {
    const {code}=tutorSchema.parse(req.body);
    const r=await service.upgradeToTutor(req.user.uid,code);
    return res.json(r);
  } catch (e) {return next(e);}
});

// Solo gestor: asignar o quitar rol gestor
const roleSchema=z.object({uid:z.string(),makeManager:z.boolean()});
router.post("/set-manager",requireRoles("manager"),async (req,res,next)=>{
  try {
    const {uid,makeManager}=roleSchema.parse(req.body);
    const r=await service.setManager(uid,makeManager);
    return res.json(r);
  } catch (e) {return next(e);}
});

module.exports=router;
