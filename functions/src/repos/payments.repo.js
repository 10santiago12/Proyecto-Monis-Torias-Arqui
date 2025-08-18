/**
 * PaymentsRepo
 * Registra intentos de pago y su estado.
 * Ahora guarda también tutorId para poder acreditar earnings.
 */

const admin = require("firebase-admin");
const db = admin.firestore();
const COL = "payments";

class PaymentsRepo {
  async create(data) {
    // data: {sessionId,tutorId,userId,amount,currency,provider,
    //        paymentId,direction,status,createdAt}
    const ref = await db.collection(COL).add(data);
    return { id: ref.id, ...data };
  }

  async getByProviderId(paymentId) {
    const qs = await db.collection(COL)
      .where("paymentId", "==", paymentId).limit(1).get();
    if (qs.empty) return null;
    const d = qs.docs[0];
    return { id: d.id, ...d.data() };
  }

  async markStatus(id, status) {
    await db.collection(COL).doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });
  }
}

module.exports = { PaymentsRepo };
