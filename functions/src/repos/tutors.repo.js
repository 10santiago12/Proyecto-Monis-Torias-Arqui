const admin=require("firebase-admin");
const db=admin.firestore();
const CODES="tutor_codes";
const PROFILES="tutors";

class TutorsRepo{
  async createCode(managerUid,note){
    const code=await this._genUniqueCode();
    const data={code,createdBy:managerUid,note:note||"",
      active:true,claimedBy:null,createdAt:new Date().toISOString()};
    const ref=await db.collection(CODES).doc(code).set(data);
    return data;
  }

  async claimCode(uid,code){
    const doc=await db.collection(CODES).doc(code).get();
    if(!doc.exists)throw new Error("Code not found");
    const c=doc.data();
    if(!c.active||c.claimedBy)throw new Error("Code already used");
    await db.collection(CODES).doc(code).update({
      active:false,claimedBy:uid,claimedAt:new Date().toISOString(),
    });
    return {code};
  }

  async ensureTutorProfile(uid,data){
    const ref=db.collection(PROFILES).doc(uid);
    await ref.set(data,{merge:true});
  }

  async getByCode(code){
    const doc=await db.collection(CODES).doc(code).get();
    if(!doc.exists)return null;
    const d=doc.data();
    // si ya fue reclamado, uid=tutor
    if(d.claimedBy){return {uid:d.claimedBy,code:d.code};}
    return {uid:null,code:d.code};
  }

  async _genUniqueCode(){
    // simple: 8 chars alfanum, reintenta si existe
    const make=()=>Math.random().toString(36).slice(2,10).toUpperCase();
    let code=make();
    let snap=await db.collection(CODES).doc(code).get();
    while(snap.exists){code=make();snap=await db.collection(CODES).doc(code).get();}
    return code;
  }
}

module.exports={TutorsRepo};
