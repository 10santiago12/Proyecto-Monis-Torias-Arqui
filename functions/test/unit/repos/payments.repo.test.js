const { PaymentsRepo } = require('../../../src/repos/payments.repo');

// Must mock firebase-admin BEFORE requiring the repo
jest.mock('firebase-admin', () => {
  const mockGet = jest.fn();
  const mockUpdate = jest.fn();
  const mockAdd = jest.fn();
  const mockDoc = jest.fn(() => ({
    get: mockGet,
    update: mockUpdate,
  }));

  return {
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: mockDoc,
        add: mockAdd,
      })),
    })),
    initializeApp: jest.fn(),
  };
});

describe('PaymentsRepo', () => {
  let repo;
  const admin = require('firebase-admin');
  const db = admin.firestore();
  let mockCollection;
  let mockGet;
  let mockAdd;
  let mockUpdate;
  let mockDoc;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGet = jest.fn();
    mockAdd = jest.fn();
    mockUpdate = jest.fn();
    mockDoc = jest.fn(() => ({
      get: mockGet,
      update: mockUpdate,
    }));

    mockCollection = {
      doc: mockDoc,
      add: mockAdd,
    };

    db.collection.mockReturnValue(mockCollection);
    repo = new PaymentsRepo();
  });

  describe('create', () => {
    it('should create a new payment', async () => {
      const paymentData = {
        sessionId: 'session1',
        tutorId: 'tutor1',
        amount: 100,
        status: 'requested',
      };
      mockAdd.mockResolvedValue({ id: 'payment1' });

      const result = await repo.create(paymentData);

      expect(mockAdd).toHaveBeenCalledWith(paymentData);
      expect(result).toEqual({ id: 'payment1', ...paymentData });
    });
  });

  describe('getById', () => {
    it('should return null if payment does not exist', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const result = await repo.getById('payment1');

      expect(mockDoc).toHaveBeenCalledWith('payment1');
      expect(result).toBeNull();
    });

    it('should return payment data if exists', async () => {
      const paymentData = { amount: 100, status: 'approved' };
      mockGet.mockResolvedValue({
        exists: true,
        id: 'payment1',
        data: () => paymentData,
      });

      const result = await repo.getById('payment1');

      expect(result).toEqual({ id: 'payment1', ...paymentData });
    });
  });

  describe('update', () => {
    it('should update payment', async () => {
      const patch = { status: 'paid', paidAt: '2024-01-20T14:00:00Z' };
      mockUpdate.mockResolvedValue();

      await repo.update('payment1', patch);

      expect(mockDoc).toHaveBeenCalledWith('payment1');
      expect(mockUpdate).toHaveBeenCalledWith(patch);
    });
  });
});
