// Mock firebase-admin BEFORE requiring the repo
jest.mock('firebase-admin', () => {
  const mockGet = jest.fn();
  const mockAdd = jest.fn();
  const mockWhere = jest.fn();
  const mockLimit = jest.fn();

  return {
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        add: mockAdd,
        where: mockWhere,
      })),
    })),
    initializeApp: jest.fn(),
  };
});

const { EarningsRepo } = require('../../../src/repos/earnings.repo');

describe('EarningsRepo', () => {
  let repo;
  const admin = require('firebase-admin');
  const db = admin.firestore();
  let mockAdd;
  let mockWhere;
  let mockLimit;
  let mockGet;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAdd = jest.fn();
    mockGet = jest.fn();
    mockLimit = jest.fn();
    mockWhere = jest.fn();

    db.collection.mockReturnValue({
      add: mockAdd,
      where: mockWhere,
    });

    repo = new EarningsRepo();
  });

  describe('create', () => {
    it('should create a new earning', async () => {
      const earningData = {
        tutorId: 'tutor1',
        sessionId: 'session1',
        paymentId: 'payment1',
        grossAmount: 100,
        feeAmount: 10,
        netAmount: 90,
        status: 'accrued',
      };
      mockAdd.mockResolvedValue({ id: 'earning1' });

      const result = await repo.create(earningData);

      expect(mockAdd).toHaveBeenCalledWith(earningData);
      expect(result).toEqual({ id: 'earning1', ...earningData });
    });
  });

  describe('getByPaymentId', () => {
    it('should return null if no earning found', async () => {
      mockGet.mockResolvedValue({ empty: true, docs: [] });
      mockLimit.mockReturnValue({ get: mockGet });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await repo.getByPaymentId('payment999');

      expect(mockWhere).toHaveBeenCalledWith('paymentId', '==', 'payment999');
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });

    it('should return earning if found', async () => {
      const earningData = { tutorId: 'tutor1', grossAmount: 100 };
      mockGet.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'earning1',
            data: () => earningData,
          },
        ],
      });
      mockLimit.mockReturnValue({ get: mockGet });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await repo.getByPaymentId('payment1');

      expect(result).toEqual({ id: 'earning1', ...earningData });
    });
  });

  describe('listByTutor', () => {
    it('should return all earnings for a tutor', async () => {
      const earnings = [
        { id: 'e1', tutorId: 'tutor1', netAmount: 90 },
        { id: 'e2', tutorId: 'tutor1', netAmount: 180 },
      ];
      mockGet.mockResolvedValue({
        docs: earnings.map((e) => ({
          id: e.id,
          data: () => ({ tutorId: e.tutorId, netAmount: e.netAmount }),
        })),
      });
      mockWhere.mockReturnValue({ get: mockGet });

      const result = await repo.listByTutor('tutor1');

      expect(mockWhere).toHaveBeenCalledWith('tutorId', '==', 'tutor1');
      expect(result).toEqual(earnings);
    });

    it('should return empty array if no earnings', async () => {
      mockGet.mockResolvedValue({ docs: [] });
      mockWhere.mockReturnValue({ get: mockGet });

      const result = await repo.listByTutor('tutor999');

      expect(result).toEqual([]);
    });
  });
});
