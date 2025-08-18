/**
 * EarningsService
 * Acredita ingresos al tutor cuando un pago pasa a "paid".
 *
 * SRP: encapsula la política de acreditación.
 * OCP/Strategy: la comisión se puede inyectar/variar.
 * Idempotencia: usa paymentId para no duplicar asientos.
 */

const { EarningsRepo } = require("../../repos/earnings.repo");

class EarningsService {
  constructor({ earningsRepo = new EarningsRepo(), feePct = 0.1 } = {}) {
    this.earnings = earningsRepo;
    this.feePct = feePct; // 10% plataforma (demo)
  }

  /**
   * Crea un earning para el tutor si no existe para ese paymentId.
   * @param {object} p payment doc desde PaymentsRepo
   */
  async creditFromPayment(p) {
    // p: {id, tutorId, sessionId, amount, currency, paymentId}
    if (!p.tutorId) {
      throw new Error("Payment without tutorId");
    }
    const exists = await this.earnings.getByPaymentId(p.paymentId);
    if (exists) return exists; // idempotente

    const fee = Math.round(p.amount * this.feePct);
    const net = Math.max(0, p.amount - fee);

    return this.earnings.create({
      tutorId: p.tutorId,
      sessionId: p.sessionId,
      paymentId: p.paymentId,
      currency: p.currency || "COP",
      grossAmount: p.amount,
      feeAmount: fee,
      netAmount: net,
      status: "accrued", // para futuras liquidaciones
      createdAt: new Date().toISOString(),
    });
  }
}

module.exports = { EarningsService };
