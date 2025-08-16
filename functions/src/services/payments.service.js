const { PaymentsRepo } = require("../repos/payments.repo");
const { MaterialsRepo } = require("../repos/materials.repo");
const { SessionsRepo } = require("../repos/sessions.repo");
const { PaymentAdapterMock } = require("../adapters/payment.adapter.mock");

class PaymentsService {
  constructor() {
    this.repo = new PaymentsRepo();
    this.materials = new MaterialsRepo();
    this.sessions = new SessionsRepo();
    this.adapter = new PaymentAdapterMock(); // luego cambias a Stripe/MercadoPago
  }

  async createCheckout(user, sessionId) {
    // 1) Cargar sesión
    const session = await this.sessions.get(sessionId);
    if (!session) {
      const e = new Error("Session not found");
      e.status = 404;
      throw e;
    }

    // 2) Autorización: admin, tutor asignado o estudiante de la sesión
    const isTutorOwner = session.tutorId === user.uid;
    const isStudent =
      Array.isArray(session.studentIds) &&
      session.studentIds.includes(user.uid);

    const canPay =
      user.role === "admin" ||
      (user.role === "tutor" && isTutorOwner) ||
      (user.role === "student" && isStudent);

    if (!canPay) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }

    // 3) Monto y moneda desde la sesión (con fallback para demo)
    const amount =
      typeof session.price === "number" && session.price >= 0
        ? Math.round(session.price)
        : 50000;
    const currency =
      typeof session.currency === "string" && session.currency.length > 0
        ? session.currency
        : "COP";

    // 4) Crear checkout en el adaptador
    const { paymentId, url } = await this.adapter.createCheckout({
      sessionId,
      amount,
      currency,
      customerId: user.uid,
    });

    // 5) Registrar intento de pago (status pending)
    await this.repo.create({
      sessionId,
      userId: user.uid,
      amount,
      currency,
      paymentId, // ID del proveedor (mock)
      provider: "mock",
      status: "pending",
    });

    return { url, paymentId };
  }

  async getStatus(_user, paymentId) {
    // 1) Consultar al proveedor (mock)
    const providerStatus = await this.adapter.getStatus(paymentId);

    // 2) Persistir status y (si pagado) desbloquear materiales de esa sesión
    const payment = await this.repo.getByProviderId(paymentId);
    if (payment) {
      await this.repo.setStatus(payment.id, providerStatus.status);
      if (providerStatus.status === "paid" && payment.sessionId) {
        await this.materials.unlockBySession(payment.sessionId);
      }
    }

    return providerStatus;
  }
}

module.exports = { PaymentsService };
