const { EarningsService } = require('../../../src/services/payouts/earnings.service');

describe('EarningsService', () => {
  let service;
  let mockEarningsRepo;

  beforeEach(() => {
    mockEarningsRepo = {
      create: jest.fn(),
      getByPaymentId: jest.fn(),
    };

    service = new EarningsService({
      earningsRepo: mockEarningsRepo,
      feePct: 0.1, // 10% fee
    });
  });

  describe('creditFromPayout', () => {
    it('should throw error if tutorId is missing', async () => {
      const payment = {
        id: 'payment1',
        sessionId: 'session1',
        amount: 100,
        currency: 'USD',
        type: 'payout',
      };

      await expect(service.creditFromPayout(payment)).rejects.toThrow('Missing tutorId');
    });

    it('should return existing earning if already credited', async () => {
      const payment = {
        id: 'payment1',
        tutorId: 'tutor1',
        sessionId: 'session1',
        amount: 100,
        currency: 'USD',
      };
      const existingEarning = { id: 'earning1', paymentId: 'payment1' };
      mockEarningsRepo.getByPaymentId.mockResolvedValue(existingEarning);

      const result = await service.creditFromPayout(payment);

      expect(mockEarningsRepo.getByPaymentId).toHaveBeenCalledWith('payment1');
      expect(mockEarningsRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingEarning);
    });

    it('should create new earning with correct fee calculation', async () => {
      const payment = {
        id: 'payment2',
        tutorId: 'tutor2',
        sessionId: 'session2',
        amount: 100,
        currency: 'USD',
        type: 'payout',
      };
      mockEarningsRepo.getByPaymentId.mockResolvedValue(null);
      mockEarningsRepo.create.mockResolvedValue({ id: 'earning2' });

      const result = await service.creditFromPayout(payment);

      expect(mockEarningsRepo.getByPaymentId).toHaveBeenCalledWith('payment2');
      expect(mockEarningsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tutorId: 'tutor2',
          sessionId: 'session2',
          paymentId: 'payment2',
          currency: 'USD',
          grossAmount: 100,
          feeAmount: 10, // 10% of 100
          netAmount: 90, // 100 - 10
          status: 'accrued',
        })
      );
      expect(result).toEqual({ id: 'earning2' });
    });

    it('should handle different fee percentages', async () => {
      const customService = new EarningsService({
        earningsRepo: mockEarningsRepo,
        feePct: 0.15, // 15% fee
      });

      const payment = {
        id: 'payment3',
        tutorId: 'tutor3',
        sessionId: 'session3',
        amount: 200,
        currency: 'COP',
      };
      mockEarningsRepo.getByPaymentId.mockResolvedValue(null);
      mockEarningsRepo.create.mockResolvedValue({ id: 'earning3' });

      await customService.creditFromPayout(payment);

      expect(mockEarningsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          grossAmount: 200,
          feeAmount: 30, // 15% of 200
          netAmount: 170, // 200 - 30
        })
      );
    });

    it('should ensure netAmount is never negative', async () => {
      const payment = {
        id: 'payment4',
        tutorId: 'tutor4',
        sessionId: 'session4',
        amount: 5, // Very small amount
        currency: 'USD',
      };
      mockEarningsRepo.getByPaymentId.mockResolvedValue(null);
      mockEarningsRepo.create.mockResolvedValue({ id: 'earning4' });

      await service.creditFromPayout(payment);

      expect(mockEarningsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          grossAmount: 5,
          feeAmount: 1, // Rounded from 0.5
          netAmount: 4, // Should be >= 0
        })
      );
      const call = mockEarningsRepo.create.mock.calls[0][0];
      expect(call.netAmount).toBeGreaterThanOrEqual(0);
    });

    it('should use default currency COP if not provided', async () => {
      const payment = {
        id: 'payment5',
        tutorId: 'tutor5',
        sessionId: 'session5',
        amount: 50000,
      };
      mockEarningsRepo.getByPaymentId.mockResolvedValue(null);
      mockEarningsRepo.create.mockResolvedValue({ id: 'earning5' });

      await service.creditFromPayout(payment);

      expect(mockEarningsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'COP',
        })
      );
    });
  });
});
