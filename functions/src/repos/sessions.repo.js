/**
 * SessionsRepo
 * Guarda info suficiente para calcular pagos.
 * Campos previstos:
 *  - tutorId (string, requerido)
 *  - durationMin (number) y hourlyRate (number), O bien 'price' directo
 *  - currency (string, ej. "COP")
 */

const admin = require("firebase-admin");
const db = admin.firestore();
const COL = "sessions";

class SessionsRepo {
  async getById(id) {
    const doc = await db.collection(COL).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async create(data) {
    const ref = await db.collection(COL).add(data);
    return { id: ref.id, ...data };
  }
}

module.exports = { SessionsRepo };
