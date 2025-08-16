const { Router } = require("express");
const { MaterialsService } = require("../services/materials.service");

const router = Router();
const svc = new MaterialsService();

router.post("/upload-url", async (req, res, next) => {
  try {
    const { sessionId, filename } = req.body;
    const url = await svc.getUploadUrl(req.user, { sessionId, filename });
    res.json({ uploadUrl: url });
  } catch (e) {next(e);}
});

router.get("/:id/download-url", async (req, res, next) => {
  try {
    const url = await svc.getDownloadUrl(req.user, req.params.id);
    res.json({ downloadUrl: url });
  } catch (e) {next(e);}
});

module.exports = router;
