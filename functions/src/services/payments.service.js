const {PaymentsRepo}=require("../repos/payments.repo");
const {SessionsRepo}=require("../repos/sessions.repo");
const {EarningsService}=require("./payouts/earnings.service");

class PaymentsService{
  constructor({paymentsRepo=new PaymentsRepo(),sessionsRepo=new SessionsRepo(),
    earnings=new EarningsService()}={}){
    this.payments=paymentsRepo;
    this.sessions=sessionsRepo;
    this.earnings=earnings;
  }

  // TUTOR solicita pago por una sesión realizada
  async requestPayout(user,sessionId){
    const s=await this.sessions.getById(sessionId);
    if(!s)throw new Error("Session not found");
    if(s.status!=="done"){throw new Error("Session not done");}
    // Debe ser el tutor
    if(s.tutorId&&s.tutorId!==user.uid){throw new Error("Not your session");}
    const amount=this._calcAmount(s);
    const doc=await this.payments.create({
      sessionId:s.id,
      tutorId:s.tutorId||null,
      requesterId:user.uid,
      amount:amount,
      currency:s.currency||"COP",
      type:"payout",
      status:"requested",
      createdAt:new Date().toISOString(),
    });
    return doc;
  }

  // MANAGER aprueba (todavía no marca paid)
  async approvePayout(manager,paymentId){
    const p=await this.payments.getById(paymentId);
    if(!p)throw new Error("Payment not found");
    if(p.status!=="requested"){throw new Error("Invalid state");}
    const upd={status:"approved",approvedBy:manager.uid,
      approvedAt:new Date().toISOString()};
    await this.payments.update(paymentId,upd);
    return {...p,...upd,id:paymentId};
  }

  // MANAGER marca pagado y acredita earning
  async markPaid(manager,paymentId){
    const p=await this.payments.getById(paymentId);
    if(!p)throw new Error("Payment not found");
    if(p.status!=="approved"){throw new Error("Must be approved first");}
    // Acredita earning (idempotente si reintenta)
    await this.earnings.creditFromPayout(p);
    const upd={status:"paid",paidBy:manager.uid,
      paidAt:new Date().toISOString()};
    await this.payments.update(paymentId,upd);
    return {...p,...upd,id:paymentId};
  }

  _calcAmount(s){
    if(typeof s.price==="number"&&s.price>0){return s.price;}
    const rate=Number(s.hourlyRate||0);
    const mins=Number(s.durationMin||0);
    const val=Math.round((rate*mins)/60);
    return val>0?val:50000;
  }
}

module.exports={PaymentsService};
