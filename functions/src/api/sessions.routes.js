const { Router } = require("express");
const { SessionsService } = require("../services/sessions.service");
const { z } = require("zod");

const router = Router();
const svc = new SessionsService();

const SessionDto = z.object({
  tutorId: z.string(),
  studentIds: z.array(z.string()).min(1),
  type: z.enum(["virtual","presencial","grupal"]),
  price: z.number().nonnegative(),
  currency: z.string().default("COP"),
  scheduledAt: z.string() // ISO
});

router.post("/", async (req, res, next) => {
  try {
    const dto = SessionDto.parse(req.body);
    const created = await svc.create(req.user, dto);
    res.status(201).json(created);
  } catch (e) {next(e);}
});

router.get("/", async (req, res, next) => {
  try {
    const list = await svc.list(req.user);
    res.json(list);
  } catch (e) {next(e);}
});

router.patch("/:id", async (req, res, next) => {
  try {
    const updated = await svc.update(req.user, req.params.id, req.body);
    res.json(updated);
  } catch (e) {next(e);}
});

router.delete("/:id", async (req, res, next) => {
  try {
    await svc.cancel(req.user, req.params.id);
    res.status(204).end();
  } catch (e) {next(e);}
});

module.exports = router;
