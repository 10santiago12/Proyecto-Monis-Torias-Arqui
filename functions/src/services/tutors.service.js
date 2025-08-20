// functions/src/services/tutors.service.js
const { TutorsRepo } = require("../repos/tutors.repo");

class TutorsService {
  constructor({ repo = new TutorsRepo() } = {}) {
    this.repo = repo;
  }

  async listAllTutors() {
    return this.repo.listAll();
  }

  async assignCodeToTutor(managerUid, tutorUid, note) {
    const c = await this.repo.createCode(managerUid, note);
    await this.repo.claimCode(tutorUid, c.code);

    // 👇 al guardar perfil, intenta persistir email/displayName desde Auth
    await this.repo.ensureTutorProfile(tutorUid, {
      role: "tutor",
      code: c.code,
      updatedAt: new Date().toISOString(),
    });

    return { code: c.code, uid: tutorUid };
  }
}

module.exports = { TutorsService };