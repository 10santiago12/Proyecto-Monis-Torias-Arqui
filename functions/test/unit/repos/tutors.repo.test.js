// Mock firebase-admin BEFORE requiring the repo
jest.mock('firebase-admin', () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn();
  const mockUpdate = jest.fn();
  const mockDoc = jest.fn(() => ({
    get: mockGet,
    set: mockSet,
    update: mockUpdate,
  }));

  return {
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: mockDoc,
        get: mockGet,
      })),
    })),
    initializeApp: jest.fn(),
  };
});

const { TutorsRepo } = require('../../../src/repos/tutors.repo');

describe('TutorsRepo', () => {
  let repo;
  const admin = require('firebase-admin');
  const db = admin.firestore();
  let mockDoc;
  let mockGet;
  let mockSet;
  let mockUpdate;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockSet = jest.fn();
    mockUpdate = jest.fn();
    mockDoc = jest.fn(() => ({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
    }));

    db.collection.mockReturnValue({
      doc: mockDoc,
      get: mockGet,
    });

    repo = new TutorsRepo();
  });

  describe('createCode', () => {
    it('should create a tutor code', async () => {
      // Mock _genUniqueCode
      jest.spyOn(repo, '_genUniqueCode').mockResolvedValue('1234');
      mockSet.mockResolvedValue();

      const result = await repo.createCode('manager1', 'Test code');

      expect(repo._genUniqueCode).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('1234');
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          code: '1234',
          createdBy: 'manager1',
          note: 'Test code',
          active: true,
          claimedBy: null,
        })
      );
      expect(result.code).toBe('1234');
    });
  });

  describe('claimCode', () => {
    it('should throw error if code not found', async () => {
      mockGet.mockResolvedValue({ exists: false });

      await expect(repo.claimCode('tutor1', '1234')).rejects.toThrow('Code not found');
    });

    it('should throw error if code already claimed', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ active: false, claimedBy: 'tutor2' }),
      });

      await expect(repo.claimCode('tutor1', '1234')).rejects.toThrow('Code already used');
    });

    it('should claim code successfully', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ active: true, claimedBy: null }),
      });
      mockUpdate.mockResolvedValue();

      const result = await repo.claimCode('tutor1', '1234');

      expect(mockDoc).toHaveBeenCalledWith('1234');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          active: false,
          claimedBy: 'tutor1',
        })
      );
      expect(result).toEqual({ code: '1234' });
    });
  });

  describe('ensureTutorProfile', () => {
    it('should create or update tutor profile', async () => {
      const data = { role: 'tutor', code: '1234' };
      mockSet.mockResolvedValue();

      await repo.ensureTutorProfile('tutor1', data);

      expect(mockDoc).toHaveBeenCalledWith('tutor1');
      expect(mockSet).toHaveBeenCalledWith(data, { merge: true });
    });
  });

  describe('getByCode', () => {
    it('should return null if code not found', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const result = await repo.getByCode('9999');

      expect(result).toBeNull();
    });

    it('should return tutor info with uid if code claimed', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ claimedBy: 'tutor1' }),
      });

      const result = await repo.getByCode('1234');

      expect(result).toEqual({ uid: 'tutor1', code: '1234' });
    });

    it('should return null uid if code not claimed yet', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ claimedBy: null }),
      });

      const result = await repo.getByCode('5678');

      expect(result).toEqual({ uid: null, code: '5678' });
    });
  });

  describe('listAll', () => {
    it('should return all tutors', async () => {
      const tutors = [
        { id: 'tutor1', email: 'tutor1@test.com' },
        { id: 'tutor2', email: 'tutor2@test.com' },
      ];
      mockGet.mockResolvedValue({
        forEach: (callback) => {
          tutors.forEach((t) => {
            callback({
              id: t.id,
              data: () => ({ email: t.email }),
            });
          });
        },
      });

      const result = await repo.listAll();

      expect(result).toEqual(tutors);
    });
  });

  describe('_genUniqueCode', () => {
    it('should generate a unique 4-digit code', async () => {
      mockGet.mockResolvedValueOnce({ exists: false });

      const code = await repo._genUniqueCode();

      expect(code).toHaveLength(4);
      expect(code).toMatch(/^\d{4}$/);
    });

    it('should retry if code already exists', async () => {
      mockGet
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ exists: false });

      const code = await repo._genUniqueCode();

      expect(mockGet).toHaveBeenCalledTimes(2);
      expect(code).toHaveLength(4);
    });
  });
});
