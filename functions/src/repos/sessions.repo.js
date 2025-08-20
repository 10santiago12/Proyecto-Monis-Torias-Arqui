// functions/src/repos/sessions.repo.js
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
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // Nuevo: listar por tutor
  async getByTutor(tutorUid) {
    const snap = await db.collection(COL).where("tutorId", "==", tutorUid).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // Nuevo: listar por estudiante
  async getByStudent(studentUid) {
    const snap = await db.collection(COL).where("studentId", "==", studentUid).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}

module.exports = { SessionsRepo };