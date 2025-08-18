/**
 * MaterialsRepo
 * Acceso a Firestore para 'materials' (sin lock).
 */

const admin = require("firebase-admin");
const db = admin.firestore();
const COL = "materials";

class MaterialsRepo {
  async create(data) {
    const ref = await db.collection(COL).add(data);
    return { id: ref.id, ...data };
  }

  async getById(id) {
    const snap = await db.collection(COL).doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  }

  async listBySession(sessionId) {
    const qs = await db.collection(COL)
      .where("sessionId", "==", sessionId)
      .get();
    return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
}

module.exports = { MaterialsRepo };
