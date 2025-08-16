const { admin, db } = require("../firebase");

class PaymentsRepo {
  constructor() {
    this.col = db.collection("payments");
  }

  async create(data) {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const ref = await this.col.add({
      ...data,
      status: data?.status || "pending",
      createdAt: now,
      updatedAt: now,
    });
    return { id: ref.id };
  }

  async get(id) {
    const snap = await this.col.doc(id).get();
    if (!snap.exists) return null;
    return { id, ...snap.data() };
  }

  async setStatus(id, status, extra = {}) {
    const now = admin.firestore.FieldValue.serverTimestamp();
    await this.col
        .doc(id)
        .set({ status, updatedAt: now, ...extra }, { merge: true });
    return this.get(id);
  }

  // Buscar por el ID de pago que devuelve el proveedor (mock/stripe/mp)
  async getByProviderId(providerPaymentId) {
    const qs = await this.col
        .where("paymentId", "==", providerPaymentId)
        .limit(1)
        .get();
    if (qs.empty) return null;
    const doc = qs.docs[0];
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = { PaymentsRepo };
