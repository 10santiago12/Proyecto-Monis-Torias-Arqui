const admin=require("firebase-admin");
const db=admin.firestore();
const COL="user_roles";

class UsersRepo{
  async getRoles(uid){
    const d=await db.collection(COL).doc(uid).get();
    return d.exists?d.data():null;
  }
  async mergeRoles(uid,patch){
    const ref=db.collection(COL).doc(uid);
    await ref.set(patch,{merge:true});
    const d=await ref.get();
    return d.data();
  }
}

module.exports={UsersRepo};
