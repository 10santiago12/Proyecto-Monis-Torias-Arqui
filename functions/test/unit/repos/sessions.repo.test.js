const { SessionsRepo } = require('../../../src/repos/sessions.repo');
const { db } = require('../../../src/firebase');

jest.mock('../../../src/firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe('SessionsRepo', () => {
  let repo;
  let mockCollection;
  let mockDoc;
  let mockGet;
  let mockAdd;
  let mockUpdate;
  let mockWhere;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new SessionsRepo();

    mockGet = jest.fn();
    mockAdd = jest.fn();
    mockUpdate = jest.fn();
    mockWhere = jest.fn();

    mockDoc = jest.fn(() => ({
      get: mockGet,
      update: mockUpdate,
    }));

    mockCollection = {
      doc: mockDoc,
      add: mockAdd,
      get: mockGet,
      where: mockWhere,
    };

    db.collection.mockReturnValue(mockCollection);
  });

  describe('getById', () => {
    it('should return null if session does not exist', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const result = await repo.getById('session1');

      expect(db.collection).toHaveBeenCalledWith('sessions');
      expect(mockDoc).toHaveBeenCalledWith('session1');
      expect(result).toBeNull();
    });

    it('should return session data if exists', async () => {
      const sessionData = { topic: 'Math', status: 'requested' };
      mockGet.mockResolvedValue({
        exists: true,
        id: 'session1',
        data: () => sessionData,
      });

      const result = await repo.getById('session1');

      expect(result).toEqual({ id: 'session1', ...sessionData });
    });
  });

  describe('create', () => {
    it('should create a new session', async () => {
      const sessionData = {
        status: 'requested',
        studentId: 'student1',
        topic: 'Physics',
      };
      mockAdd.mockResolvedValue({ id: 'newSession' });

      const result = await repo.create(sessionData);

      expect(db.collection).toHaveBeenCalledWith('sessions');
      expect(mockAdd).toHaveBeenCalledWith(sessionData);
      expect(result).toEqual({ id: 'newSession', ...sessionData });
    });
  });

  describe('update', () => {
    it('should update session and return updated data', async () => {
      const patch = { status: 'confirmed', scheduledAt: '2024-01-20T14:00:00Z' };
      const updatedData = { topic: 'Math', ...patch };
      
      mockUpdate.mockResolvedValue();
      mockGet.mockResolvedValue({
        id: 'session1',
        data: () => updatedData,
      });

      const result = await repo.update('session1', patch);

      expect(mockDoc).toHaveBeenCalledWith('session1');
      expect(mockUpdate).toHaveBeenCalledWith(patch);
      expect(result).toEqual({ id: 'session1', ...updatedData });
    });
  });

  describe('getAll', () => {
    it('should return all sessions', async () => {
      const sessions = [
        { id: 's1', topic: 'Math' },
        { id: 's2', topic: 'Physics' },
      ];
      mockGet.mockResolvedValue({
        docs: sessions.map((s) => ({
          id: s.id,
          data: () => ({ topic: s.topic }),
        })),
      });

      const result = await repo.getAll();

      expect(db.collection).toHaveBeenCalledWith('sessions');
      expect(result).toEqual(sessions);
    });

    it('should return empty array if no sessions', async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const result = await repo.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getByTutor', () => {
    it('should return sessions for a tutor', async () => {
      const sessions = [
        { id: 's1', tutorId: 'tutor1', topic: 'Math' },
        { id: 's2', tutorId: 'tutor1', topic: 'Physics' },
      ];
      
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: sessions.map((s) => ({
            id: s.id,
            data: () => ({ tutorId: s.tutorId, topic: s.topic }),
          })),
        }),
      });

      const result = await repo.getByTutor('tutor1');

      expect(db.collection).toHaveBeenCalledWith('sessions');
      expect(mockWhere).toHaveBeenCalledWith('tutorId', '==', 'tutor1');
      expect(result).toEqual(sessions);
    });
  });

  describe('getByStudent', () => {
    it('should return sessions for a student', async () => {
      const sessions = [
        { id: 's3', studentId: 'student1', topic: 'Chemistry' },
      ];
      
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue({
          docs: sessions.map((s) => ({
            id: s.id,
            data: () => ({ studentId: s.studentId, topic: s.topic }),
          })),
        }),
      });

      const result = await repo.getByStudent('student1');

      expect(mockWhere).toHaveBeenCalledWith('studentId', '==', 'student1');
      expect(result).toEqual(sessions);
    });
  });
});
