const { admin, db, bucket } = require("../firebase");

class MaterialsRepo {
  constructor() {
    this.col = db.collection("materials");
    this.bucket = bucket; // Útil si generas Signed URLs (prod). En demo puedes no usarlo.
  }

  async register({ sessionId, filename, storagePath, allowedUserIds = [], isLocked = true }) {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await this.col.add({
      sessionId,
      filename,
      storagePath: storagePath || "",
      allowedUserIds,
      isLocked,
      createdAt: now,
      updatedAt: now,
    });
    const snap = await ref.get();
    return { id: ref.id, ...snap.data() };
  }

  async get(id) {
    const snap = await this.col.doc(id).get();
    if (!snap.exists) return null;
    return { id: snap.id, ...snap.data() };
  }

  async update(id, patch) {
    const now = admin.firestore.FieldValue.serverTimestamp();
    await this.col.doc(id).set({ ...patch, updatedAt: now }, { merge: true });
    const snap = await this.col.doc(id).get();
    return { id, ...snap.data() };
  }

  async listBySession(sessionId) {
    const qs = await this.col.where("sessionId", "==", sessionId).get();
    return qs.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  // Desbloquea todos los materiales asociados a una sesión
  async unlockBySession(sessionId) {
    const qs = await this.col
        .where("sessionId", "==", sessionId)
        .where("isLocked", "==", true)
        .get();

    if (qs.empty) return { updated: 0 };

    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();

    qs.docs.forEach((doc) => {
      batch.set(
          this.col.doc(doc.id),
          { isLocked: false, updatedAt: now },
          { merge: true }
      );
    });

    await batch.commit();
    return { updated: qs.size };
  }
}

module.exports = { MaterialsRepo };
