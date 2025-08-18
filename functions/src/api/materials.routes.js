/**
 * Materiales: endpoints sin "lock".
 * - POST /materials/upload-url
 * - GET  /materials/:id/download-url
 */

const express = require("express");
const { z } = require("zod");
const { MaterialsService } = require("../services/materials.service");

const router = express.Router();
const service = new MaterialsService();

const upSchema = z.object({
  sessionId: z.string().min(1),
  filename: z.string().min(1),
});

router.post("/upload-url", async (req, res, next) => {
  try {
    const dto = upSchema.parse(req.body);
    const r = await service.requestUpload(req.user, dto);
    return res.status(201).json(r);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/download-url", async (req, res, next) => {
  try {
    const r = await service.getDownloadUrl(req.params.id);
    return res.json(r);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
