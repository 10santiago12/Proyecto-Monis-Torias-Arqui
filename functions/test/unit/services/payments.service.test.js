const { PaymentsService } = require('../../../src/services/payments.service');

describe('PaymentsService', () => {
  let service;
  let mockPaymentsRepo;
  let mockSessionsRepo;
  let mockEarningsService;

  beforeEach(() => {
    mockPaymentsRepo = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
    };

    mockSessionsRepo = {
      getById: jest.fn(),
    };

    mockEarningsService = {
      creditFromPayout: jest.fn(),
    };

    service = new PaymentsService({
      paymentsRepo: mockPaymentsRepo,
      sessionsRepo: mockSessionsRepo,
      earnings: mockEarningsService,
    });
  });

  describe('requestPayout', () => {
    it('should throw error if session not found', async () => {
      mockSessionsRepo.getById.mockResolvedValue(null);

      await expect(
        service.requestPayout({ uid: 'tutor1' }, 'session1')
      ).rejects.toThrow('Session not found');
    });

    it('should throw error if session not done', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session1',
        status: 'confirmed',
        tutorId: 'tutor1',
      });

      await expect(
        service.requestPayout({ uid: 'tutor1' }, 'session1')
      ).rejects.toThrow('Session not done');
    });

    it('should throw error if not tutor session', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session1',
        status: 'done',
        tutorId: 'tutor2',
      });

      await expect(
        service.requestPayout({ uid: 'tutor1' }, 'session1')
      ).rejects.toThrow('Not your session');
    });

    it('should create payment with price from session', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session1',
        status: 'done',
        tutorId: 'tutor1',
        price: 100,
        currency: 'USD',
      });
      mockPaymentsRepo.create.mockResolvedValue({ id: 'payment1' });

      const result = await service.requestPayout({ uid: 'tutor1' }, 'session1');

      expect(mockPaymentsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session1',
          tutorId: 'tutor1',
          requesterId: 'tutor1',
          amount: 100,
          currency: 'USD',
          type: 'payout',
          status: 'requested',
        })
      );
      expect(result).toEqual({ id: 'payment1' });
    });

    it('should calculate amount from hourlyRate and durationMin', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session2',
        status: 'done',
        tutorId: 'tutor1',
        hourlyRate: 60000,
        durationMin: 90,
        currency: 'COP',
      });
      mockPaymentsRepo.create.mockResolvedValue({ id: 'payment2' });

      await service.requestPayout({ uid: 'tutor1' }, 'session2');

      expect(mockPaymentsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 90000, // 60000 * 90 / 60 = 90000
        })
      );
    });

    it('should use default amount if calculation fails', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session3',
        status: 'done',
        tutorId: 'tutor1',
        currency: 'COP',
      });
      mockPaymentsRepo.create.mockResolvedValue({ id: 'payment3' });

      await service.requestPayout({ uid: 'tutor1' }, 'session3');

      expect(mockPaymentsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50000, // default fallback
        })
      );
    });
  });

  describe('approvePayout', () => {
    it('should throw error if payment not found', async () => {
      mockPaymentsRepo.getById.mockResolvedValue(null);

      await expect(
        service.approvePayout({ uid: 'manager1' }, 'payment1')
      ).rejects.toThrow('Payment not found');
    });

    it('should throw error if payment not in requested state', async () => {
      mockPaymentsRepo.getById.mockResolvedValue({
        id: 'payment1',
        status: 'approved',
      });

      await expect(
        service.approvePayout({ uid: 'manager1' }, 'payment1')
      ).rejects.toThrow('Invalid state');
    });

    it('should approve payment', async () => {
      mockPaymentsRepo.getById.mockResolvedValue({
        id: 'payment1',
        status: 'requested',
        amount: 100,
      });
      mockPaymentsRepo.update.mockResolvedValue();

      const result = await service.approvePayout({ uid: 'manager1' }, 'payment1');

      expect(mockPaymentsRepo.update).toHaveBeenCalledWith(
        'payment1',
        expect.objectContaining({
          status: 'approved',
          approvedBy: 'manager1',
        })
      );
      expect(result.status).toBe('approved');
      expect(result.approvedBy).toBe('manager1');
    });
  });

  describe('markPaid', () => {
    it('should throw error if payment not found', async () => {
      mockPaymentsRepo.getById.mockResolvedValue(null);

      await expect(
        service.markPaid({ uid: 'manager1' }, 'payment1')
      ).rejects.toThrow('Payment not found');
    });

    it('should throw error if payment not approved', async () => {
      mockPaymentsRepo.getById.mockResolvedValue({
        id: 'payment1',
        status: 'requested',
      });

      await expect(
        service.markPaid({ uid: 'manager1' }, 'payment1')
      ).rejects.toThrow('Must be approved first');
    });

    it('should credit earnings and mark payment as paid', async () => {
      mockPaymentsRepo.getById.mockResolvedValue({
        id: 'payment1',
        status: 'approved',
        tutorId: 'tutor1',
        amount: 100,
      });
      mockEarningsService.creditFromPayout.mockResolvedValue({ id: 'earning1' });
      mockPaymentsRepo.update.mockResolvedValue();

      const result = await service.markPaid({ uid: 'manager1' }, 'payment1');

      expect(mockEarningsService.creditFromPayout).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'payment1',
          status: 'approved',
          tutorId: 'tutor1',
          amount: 100,
        })
      );
      expect(mockPaymentsRepo.update).toHaveBeenCalledWith(
        'payment1',
        expect.objectContaining({
          status: 'paid',
          paidBy: 'manager1',
        })
      );
      expect(result.status).toBe('paid');
      expect(result.paidBy).toBe('manager1');
    });
  });

  describe('_calcAmount', () => {
    it('should use price if available', () => {
      const session = { price: 150 };
      expect(service._calcAmount(session)).toBe(150);
    });

    it('should calculate from hourlyRate and durationMin', () => {
      const session = { hourlyRate: 100, durationMin: 30 };
      expect(service._calcAmount(session)).toBe(50); // 100 * 30 / 60
    });

    it('should return default if no valid data', () => {
      const session = {};
      expect(service._calcAmount(session)).toBe(50000);
    });
  });
});
