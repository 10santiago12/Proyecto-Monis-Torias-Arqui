// functions/src/repos/tutors.repo.js
const admin = require("firebase-admin");
const db = admin.firestore();

const CODES = "tutor_codes";
const PROFILES = "tutors";

class TutorsRepo {
  async createCode(managerUid, note) {
    const code = await this._genUniqueCode(); // 4 dígitos
    const data = {
      code,
      createdBy: managerUid,
      note: note || "",
      active: true,
      claimedBy: null,
      createdAt: new Date().toISOString(),
    };
    await db.collection(CODES).doc(code).set(data);
    return data;
  }

  async claimCode(uid, code) {
    const doc = await db.collection(CODES).doc(code).get();
    if (!doc.exists) throw new Error("Code not found");
    const c = doc.data();
    if (!c.active || c.claimedBy) throw new Error("Code already used");
    await db.collection(CODES).doc(code).update({
      active: false,
      claimedBy: uid,
      claimedAt: new Date().toISOString(),
    });
    return { code };
  }

  async ensureTutorProfile(uid, data) {
    const ref = db.collection(PROFILES).doc(uid);
    await ref.set(data, { merge: true });
  }

  async getByCode(code) {
    const doc = await db.collection(CODES).doc(code).get();
    if (!doc.exists) return null;
    const d = doc.data();
    if (d.claimedBy) return { uid: d.claimedBy, code: d.code };
    return { uid: null, code: d.code };
  }

  // NUEVO: listar todos los tutores (colección "tutors")
  async listAll() {
    const snap = await db.collection(PROFILES).get();
    const out = [];
    snap.forEach((doc) => out.push({ id: doc.id, ...doc.data() }));
    return out;
  }

  async _genUniqueCode() {
    const make = () =>
      Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    let code = make();
    let snap = await db.collection(CODES).doc(code).get();
    while (snap.exists) {
      code = make();
      snap = await db.collection(CODES).doc(code).get();
    }
    return code;
  }
}

module.exports = { TutorsRepo };