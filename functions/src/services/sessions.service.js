const { SessionsRepo } = require("../repos/sessions.repo");

class SessionsService {
  constructor() {this.repo = new SessionsRepo();}

  async create(user, dto) {
    // regla simple: tutor/admin pueden crear
    if (!["admin","tutor"].includes(user.role)) {
      const e = new Error("Forbidden"); e.status = 403; throw e;
    }
    return this.repo.create({ ...dto, owner: user.uid });
  }

  async list(user) {
    return this.repo.listByUser(user);
  }

  async update(user, id, patch) {
    // TODO: validar ownership/rol
    return this.repo.update(id, patch);
  }

  async cancel(user, id) {
    return this.repo.update(id, { status: "cancelada" });
  }
}

module.exports = { SessionsService };
