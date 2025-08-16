const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid"); // npm i uuid (en functions)

class MaterialsService {
  constructor() {
    this.bucket = admin.storage().bucket(); // usa el bucket del proyecto
  }

  async getUploadUrl(user, { sessionId, filename, contentType = "application/octet-stream" }) {
    // Registra el material y genera nombre físico
    const filePath = `materials/${sessionId}/${uuidv4()}-${filename}`;
    const file = this.bucket.file(filePath);

    // URL firmada de subida (PUT) por 15 min
    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType
    });

    // Guarda/actualiza tu doc en Firestore
    const saved = await this.repo.register({ sessionId, filename, storagePath: filePath });
    return { uploadUrl, materialId: saved.id };
  }

  async getDownloadUrl(user, materialId) {
    const material = await this.repo.get(materialId);
    if (!material) {const e = new Error("Not found"); e.status = 404; throw e;}

    // Verifica que el usuario pagó/puede ver
    // if (!await hasPaid(user.uid, material.sessionId)) { const e = new Error("Forbidden"); e.status = 403; throw e; }

    const file = this.bucket.file(material.storagePath);

    // URL firmada de lectura por 15 min
    const [downloadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 15 * 60 * 1000
    });

    return { downloadUrl };
  }
}

module.exports = { MaterialsService };
