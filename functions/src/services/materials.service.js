/**
 * MaterialsService
 * Ahora los materiales NO se bloquean por pago. Cualquier usuario
 * autenticado puede listarlos/descargarlos.
 *
 * SRP: solo gestiona materiales.
 * OCP: si mañana quieres "visibilidad por curso", se extiende sin
 * tocar pagos.
 */

const { MaterialsRepo } = require("../repos/materials.repo");

class MaterialsService {
  constructor({ materialsRepo = new MaterialsRepo() } = {}) {
    this.repo = materialsRepo;
  }

  /**
   * Registra metadata de un material y devuelve un uploadUrl (mock).
   * @param {{uid:string}} user
   * @param {{sessionId:string,filename:string}} dto
   */
  async requestUpload(user, dto) {
    const { sessionId, filename } = dto;
    const doc = await this.repo.create({
      sessionId,
      filename,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
    });

    // Demo: URL mock de subida
    const uploadUrl = `https://example.com/upload/${doc.id}`;
    return { materialId: doc.id, uploadUrl };
  }

  /**
   * Devuelve URL de descarga (mock). En real: URL firmada del bucket.
   * @param {string} materialId
   */
  async getDownloadUrl(materialId) {
    const m = await this.repo.getById(materialId);
    if (!m) throw new Error("Material not found");
    const downloadUrl = `https://example.com/download/${materialId}`;
    return { downloadUrl };
  }
}

module.exports = { MaterialsService };
