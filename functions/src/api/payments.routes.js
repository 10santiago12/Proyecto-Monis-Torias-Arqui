/**
 * Rutas de pagos:
 * - POST /payments/checkout -> crea intento de pago del estudiante
 * - GET  /payments/:paymentId -> consulta estado y acredita al tutor si paid
 */

const express = require("express");
const { z } = require("zod");
const { PaymentsService } = require("../services/payments.service");

const router = express.Router();
const service = new PaymentsService();

const checkoutSchema = z.object({
  sessionId: z.string().min(1),
});

router.post("/checkout", async (req, res, next) => {
  try {
    const { sessionId } = checkoutSchema.parse(req.body);
    const result = await service.createCheckout(req.user, sessionId);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
});

router.get("/:paymentId", async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const status = await service.getStatus(req.user, paymentId);
    return res.json(status);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
