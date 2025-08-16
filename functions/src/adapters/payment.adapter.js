class PaymentAdapter {
  async createCheckout({ sessionId, amount, currency, customerId }) {
    throw new Error("Not implemented");
  }
  async getStatus(paymentId) {
    throw new Error("Not implemented");
  }
}
module.exports = { PaymentAdapter };
