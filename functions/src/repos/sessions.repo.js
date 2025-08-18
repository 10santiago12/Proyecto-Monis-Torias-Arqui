const admin=require("firebase-admin");
const db=admin.firestore();
const COL="sessions";

class SessionsRepo{
  async getById(id){
    const d=await db.collection(COL).doc(id).get();
    if(!d.exists)return null;
    return {id:d.id,...d.data()};
  }
  async create(data){
    const ref=await db.collection(COL).add(data);
    return {id:ref.id,...data};
  }
  async update(id,patch){
    await db.collection(COL).doc(id).update(patch);
  }
}

module.exports={SessionsRepo};
