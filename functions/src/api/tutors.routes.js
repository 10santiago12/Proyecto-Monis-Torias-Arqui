// functions/src/api/tutors.routes.js
const express = require("express");
const { z } = require("zod");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { requireRoles } = require("../middlewares/role.middleware");
const { TutorsService } = require("../services/tutors.service");

const router = express.Router();
const service = new TutorsService();

// Listar todos los tutores
router.get("/", authMiddleware, requireRoles("manager"), async (req, res, next) => {
  try {
    const list = await service.listAllTutors();
    return res.json(list);
  } catch (e) {
    return next(e);
  }
});

// Asignar código a un tutor específico
const assignSchema = z.object({
  note: z.string().optional(),
});
router.post("/:uid/assign-code", authMiddleware, requireRoles("manager"), async (req, res, next) => {
  try {
    const { note } = assignSchema.parse(req.body || {});
    const { uid } = req.params;
    const r = await service.assignCodeToTutor(req.user.uid, uid, note);
    return res.json(r);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;