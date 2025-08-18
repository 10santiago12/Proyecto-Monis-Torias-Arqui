const admin=require("firebase-admin");
const db=admin.firestore();
const COL="materials";

class MaterialsRepo {
  async create(data) {
    const ref=await db.collection(COL).add(data);
    return {id:ref.id,...data};
  }
  async getById(id) {
    const d=await db.collection(COL).doc(id).get();
    if (!d.exists) return null;
    return {id:d.id,...d.data()};
  }
  async listBySession(sessionId) {
    const qs=await db.collection(COL).where("sessionId","==",sessionId).get();
    return qs.docs.map(d=>({id:d.id,...d.data()}));
  }
}

module.exports={MaterialsRepo};
