const { Router } = require("express");
const { PaymentsService } = require("../services/payments.service");

const router = Router();
const svc = new PaymentsService();

// Crea intento de pago (retorna URL mock por ahora)
router.post("/checkout", async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const result = await svc.createCheckout(req.user, sessionId);
    res.status(201).json(result); // { url, paymentId }
  } catch (e) {next(e);}
});

// Obtiene estado de un pago
router.get("/:paymentId", async (req, res, next) => {
  try {
    const data = await svc.getStatus(req.user, req.params.paymentId);
    res.json(data);
  } catch (e) {next(e);}
});

module.exports = router;
