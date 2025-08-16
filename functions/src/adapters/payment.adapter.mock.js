const { PaymentAdapter } = require("./payment.adapter");

class PaymentAdapterMock extends PaymentAdapter {
  async createCheckout({ sessionId, amount, currency }) {
    // Devuelve una URL ficticia
    return {
      paymentId: `pay_${Date.now()}`,
      url: `https://example.com/checkout?session=${sessionId}&amount=${amount}&currency=${currency}`
    };
  }
  async getStatus(paymentId) {
    // Simula pagado
    return { paymentId, status: "paid" };
  }
}

module.exports = { PaymentAdapterMock };
