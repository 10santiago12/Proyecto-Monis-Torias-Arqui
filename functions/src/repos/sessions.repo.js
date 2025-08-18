// Importa firebase inicializado desde lib/firebase.js
const { db } = require("../firebase");

const COL = "sessions";

class SessionsRepo {
  async getById(id) {
    const d = await db.collection(COL).doc(id).get();
    if (!d.exists) return null;
    return { id: d.id, ...d.data() };
  }

  async create(data) {
    const ref = await db.collection(COL).add(data);
    return { id: ref.id, ...data };
  }

  async update(id, patch) {
    await db.collection(COL).doc(id).update(patch);
    const updated = await db.collection(COL).doc(id).get();
    return { id: updated.id, ...updated.data() };
  }

  async getAll() {
    const snapshot = await db.collection(COL).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = { SessionsRepo };