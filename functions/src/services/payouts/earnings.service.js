const {EarningsRepo}=require("../../repos/earnings.repo");

class EarningsService {
  constructor({earningsRepo=new EarningsRepo(),feePct=0.1}={}) {
    this.earnings=earningsRepo;
    this.feePct=feePct;
  }

  // desde payout aprobado del manager
  async creditFromPayout(p) {
    // p:{id,sessionId,tutorId,amount,currency,type:'payout'}
    if (!p.tutorId) throw new Error("Missing tutorId");
    const exists=await this.earnings.getByPaymentId(p.id);
    if (exists) return exists;
    const fee=Math.round(p.amount*this.feePct);
    const net=Math.max(0,p.amount-fee);
    return this.earnings.create({
      tutorId:p.tutorId,
      sessionId:p.sessionId,
      paymentId:p.id,
      currency:p.currency||"COP",
      grossAmount:p.amount,
      feeAmount:fee,
      netAmount:net,
      status:"accrued",
      createdAt:new Date().toISOString(),
    });
  }
}

module.exports={EarningsService};
