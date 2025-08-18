// functions/src/services/tutors.service.js
const { TutorsRepo } = require("../repos/tutors.repo");

class TutorsService {
  constructor({ repo = new TutorsRepo() } = {}) {
    this.repo = repo;
  }

  async listAllTutors() {
    return this.repo.listAll();
  }

  /**
   * Crea un código (4 dígitos) y lo asigna a un tutor (claim).
   * También asegura el perfil en "tutors" con el code.
   */
  async assignCodeToTutor(managerUid, tutorUid, note) {
    const c = await this.repo.createCode(managerUid, note);
    await this.repo.claimCode(tutorUid, c.code);

    // Guarda/actualiza perfil del tutor con su code
    await this.repo.ensureTutorProfile(tutorUid, {
      role: "tutor",
      code: c.code,
      updatedAt: new Date().toISOString(),
    });

    return { code: c.code, uid: tutorUid };
  }
}

module.exports = { TutorsService };
