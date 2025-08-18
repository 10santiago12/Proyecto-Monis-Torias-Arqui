const express=require("express");
const {z}=require("zod");
const {PaymentsService}=require("../services/payments.service");
const {requireRoles}=require("../middlewares/role.middleware");

const router=express.Router();
const service=new PaymentsService();

// Tutor solicita pago por sesión realizada
const askSchema=z.object({sessionId:z.string().min(1)});
router.post("/request",requireRoles("tutor"),async (req,res,next)=>{
  try {
    const dto=askSchema.parse(req.body);
    const r=await service.requestPayout(req.user,dto.sessionId);
    return res.status(201).json(r);
  } catch (e) {return next(e);}
});

// Gestor aprueba la solicitud (queda "approved")
router.post("/:paymentId/approve",requireRoles("manager"),async (req,res,next)=>{
  try {
    const r=await service.approvePayout(req.user,req.params.paymentId);
    return res.json(r);
  } catch (e) {return next(e);}
});

// Gestor marca pagado (registra earning; estado "paid")
router.post("/:paymentId/mark-paid",requireRoles("manager"),async (req,res,next)=>{
  try {
    const r=await service.markPaid(req.user,req.params.paymentId);
    return res.json(r);
  } catch (e) {return next(e);}
});

module.exports=router;
