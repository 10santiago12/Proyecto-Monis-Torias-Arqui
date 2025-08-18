const admin=require("firebase-admin");
const db=admin.firestore();
const COL="earnings";

class EarningsRepo{
  async create(data){
    const ref=await db.collection(COL).add(data);
    return {id:ref.id,...data};
  }
  async getByPaymentId(paymentId){
    const qs=await db.collection(COL).where("paymentId","==",paymentId)
      .limit(1).get();
    if(qs.empty)return null;
    const d=qs.docs[0];
    return {id:d.id,...d.data()};
  }
  async listByTutor(tutorId){
    const qs=await db.collection(COL).where("tutorId","==",tutorId).get();
    return qs.docs.map(d=>({id:d.id,...d.data()}));
  }
}

module.exports={EarningsRepo};
