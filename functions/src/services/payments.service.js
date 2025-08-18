/**
 * PaymentsService
 * Orquesta el cobro al estudiante (checkout) y, cuando el proveedor
 * confirma "paid", acredita el ingreso al tutor (earnings).
 *
 * SOLID:
 * - SRP: esta clase solo coordina pagos y delega a repos/adapters.
 * - OCP: el adapter de pagos se inyecta (Mock, Stripe, etc.).
 * Patrón:
 * - Adapter: PaymentAdapterMock (interfaz estable) para proveedores.
 */

const { PaymentsRepo } = require("../repos/payments.repo");
const { SessionsRepo } = require("../repos/sessions.repo");
const { EarningsService } = require("./payouts/earnings.service");
const { PaymentAdapterMock } =
  require("../adapters/payment.adapter.mock");

class PaymentsService {
  constructor({
    paymentsRepo = new PaymentsRepo(),
    sessionsRepo = new SessionsRepo(),
    earningsService = new EarningsService(),
    adapter = new PaymentAdapterMock(),
  } = {}) {
    this.payments = paymentsRepo;
    this.sessions = sessionsRepo;
    this.earnings = earningsService;
    this.adapter = adapter;
  }

  /**
   * Crea un intento de cobro para una sesión.
   * Calcula el monto desde la sesión (price fijo o rate*duración).
   * @param {{uid:string}} user
   * @param {string} sessionId
   * @returns {{url:string,paymentId:string}}
   */
  async createCheckout(user, sessionId) {
    const s = await this.sessions.getById(sessionId);
    if (!s) {
      throw new Error("Session not found");
    }
    // Regla simple: puede pagar cualquier estudiante autenticado.
    // Si quieres restringir: valida que user.uid esté en s.studentIds.

    const amount = this._calcAmountFromSession(s);
    const currency = s.currency || "COP";

    const { paymentId, url } = await this.adapter.createCheckout({
      sessionId,
      amount,
      currency,
      customerId: user.uid,
    });

    await this.payments.create({
      sessionId,
      tutorId: s.tutorId,
      userId: user.uid,
      amount,
      currency,
      provider: "mock",
      paymentId,
      direction: "in", // dinero entra desde estudiante
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return { url, paymentId };
  }

  /**
   * Consulta estado al proveedor. Si está "paid" y el pago aún no
   * fue acreditado, marca paid y acredita earnings al tutor.
   * @param {{uid:string}} _user
   * @param {string} paymentId
   * @returns {{paymentId:string,status:string}}
   */
  async getStatus(_user, paymentId) {
    const providerStatus = await this.adapter.getStatus(paymentId);

    // Idempotente: solo si pasa a paid y no estaba paid.
    if (providerStatus.status === "paid") {
      const p = await this.payments.getByProviderId(paymentId);
      if (!p) {
        throw new Error("Payment not found");
      }
      if (p.status !== "paid") {
        await this.payments.markStatus(p.id, "paid");
        // Acreditar ingreso al tutor (una sola vez por payment).
        await this.earnings.creditFromPayment(p);
      }
    }
    return providerStatus;
  }

  /**
   * Obtiene monto de la sesión:
   *  - Si s.price existe, usa ese.
   *  - Si no, usa hourlyRate * (durationMin/60).
   * @param {object} s
   * @returns {number}
   */
  _calcAmountFromSession(s) {
    if (typeof s.price === "number" && s.price > 0) {
      return s.price;
    }
    const rate = Number(s.hourlyRate || 0);
    const mins = Number(s.durationMin || 0);
    const amount = Math.round((rate * mins) / 60);
    if (!amount || amount <= 0) {
      // Demo: fallback para no romper el flujo
      return 50000;
    }
    return amount;
  }
}

module.exports = { PaymentsService };
