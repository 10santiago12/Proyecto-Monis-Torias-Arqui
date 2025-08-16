const { admin, db } = require("../firebase");

class SessionsRepo {
  constructor() {
    this.col = db.collection("sessions");
  }

  async create(data) {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await this.col.add({
      ...data,
      createdAt: now,
      updatedAt: now,
      status: data?.status || "pendiente",
    });
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
  }

  async get(id) {
    const snap = await this.col.doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  }

  // Lista por rol del usuario: admin → todo; tutor → propias; student → donde participa
  async listByUser(user) {
    if (user?.role === "admin") {
      const qs = await this.col.orderBy("scheduledAt", "desc").limit(50).get();
      return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    if (user?.role === "tutor") {
      const qs = await this.col.where("tutorId", "==", user.uid).get();
      return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
    // student
    const qs = await this.col
        .where("studentIds", "array-contains", user.uid)
        .get();
    return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  async update(id, patch) {
    const now = admin.firestore.FieldValue.serverTimestamp();
    await this.col.doc(id).set({ ...patch, updatedAt: now }, { merge: true });
    const snap = await this.col.doc(id).get();
    return { id, ...snap.data() };
  }

  async remove(id) {
    await this.col.doc(id).delete();
    return { id, deleted: true };
  }
}

module.exports = { SessionsRepo };
