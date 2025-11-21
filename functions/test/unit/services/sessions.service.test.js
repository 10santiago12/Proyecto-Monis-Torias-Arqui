const { SessionsService } = require('../../../src/services/sessions.service');

describe('SessionsService', () => {
  let service;
  let mockSessionsRepo;
  let mockTutorsRepo;
  let mockNotifications;

  beforeEach(() => {
    mockSessionsRepo = {
      getAll: jest.fn(),
      getByTutor: jest.fn(),
      getByStudent: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockTutorsRepo = {
      getByCode: jest.fn(),
    };

    mockNotifications = {
      notifyUser: jest.fn(),
    };

    service = new SessionsService({
      sessionsRepo: mockSessionsRepo,
      tutorsRepo: mockTutorsRepo,
      notifications: mockNotifications,
    });
  });

  describe('listForUser', () => {
    it('should throw error if user is undefined', async () => {
      await expect(service.listForUser(undefined)).rejects.toThrow('Unauthorized');
    });

    it('should throw error if user has no uid', async () => {
      await expect(service.listForUser({})).rejects.toThrow('Unauthorized');
    });

    it('should call getAll for manager role', async () => {
      const user = { uid: 'user1', roles: { manager: true } };
      mockSessionsRepo.getAll.mockResolvedValue([{ id: 's1' }]);

      const result = await service.listForUser(user);

      expect(mockSessionsRepo.getAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 's1' }]);
    });

    it('should call getByTutor for tutor role', async () => {
      const user = { uid: 'tutor1', roles: { tutor: true } };
      mockSessionsRepo.getByTutor.mockResolvedValue([{ id: 's2' }]);

      const result = await service.listForUser(user);

      expect(mockSessionsRepo.getByTutor).toHaveBeenCalledWith('tutor1');
      expect(result).toEqual([{ id: 's2' }]);
    });

    it('should call getByStudent for student (no roles)', async () => {
      const user = { uid: 'student1' };
      mockSessionsRepo.getByStudent.mockResolvedValue([{ id: 's3' }]);

      const result = await service.listForUser(user);

      expect(mockSessionsRepo.getByStudent).toHaveBeenCalledWith('student1');
      expect(result).toEqual([{ id: 's3' }]);
    });
  });

  describe('requestSession', () => {
    it('should throw error if tutor code not found', async () => {
      mockTutorsRepo.getByCode.mockResolvedValue(null);
      const user = { uid: 'student1' };
      const dto = { tutorCode: 'INVALID', topic: 'Math', durationMin: 60 };

      await expect(service.requestSession(user, dto)).rejects.toThrow('Tutor code not found');
    });

    it('should create session with correct data', async () => {
      const tutor = { uid: 'tutor1', code: 'ABC123' };
      mockTutorsRepo.getByCode.mockResolvedValue(tutor);
      mockSessionsRepo.create.mockResolvedValue({ id: 'session1' });
      mockNotifications.notifyUser.mockResolvedValue();

      const user = { uid: 'student1' };
      const dto = {
        tutorCode: 'ABC123',
        topic: 'Math',
        description: 'Help with calculus',
        durationMin: 60,
        preferredAt: '2024-01-15T10:00:00Z',
        currency: 'USD',
        price: 50,
        hourlyRate: 30,
      };

      const result = await service.requestSession(user, dto);

      expect(mockTutorsRepo.getByCode).toHaveBeenCalledWith('ABC123');
      expect(mockSessionsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'requested',
          studentId: 'student1',
          tutorId: 'tutor1',
          tutorCode: 'ABC123',
          topic: 'Math',
          description: 'Help with calculus',
          durationMin: 60,
          currency: 'USD',
          price: 50,
        })
      );
      expect(mockNotifications.notifyUser).toHaveBeenCalledWith(
        'tutor1',
        'SESSION_REQUEST',
        expect.objectContaining({ sessionId: 'session1', topic: 'Math' })
      );
      expect(result).toEqual({ id: 'session1' });
    });

    it('should not notify if tutor has no uid (unclaimed code)', async () => {
      const tutor = { code: 'XYZ789', uid: null };
      mockTutorsRepo.getByCode.mockResolvedValue(tutor);
      mockSessionsRepo.create.mockResolvedValue({ id: 'session2' });

      const user = { uid: 'student2' };
      const dto = { tutorCode: 'XYZ789', topic: 'Physics', durationMin: 90 };

      await service.requestSession(user, dto);

      expect(mockNotifications.notifyUser).not.toHaveBeenCalled();
    });
  });

  describe('confirmByTutor', () => {
    it('should throw error if session not found', async () => {
      mockSessionsRepo.getById.mockResolvedValue(null);

      await expect(
        service.confirmByTutor({ uid: 'tutor1' }, 'session1', { scheduledAt: '2024-01-20T14:00:00Z' })
      ).rejects.toThrow('Session not found');
    });

    it('should throw error if not tutor session', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session1',
        tutorId: 'tutor2',
        status: 'requested',
      });

      await expect(
        service.confirmByTutor({ uid: 'tutor1' }, 'session1', { scheduledAt: '2024-01-20T14:00:00Z' })
      ).rejects.toThrow('Not your session');
    });

    it('should throw error if session not in requested state', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session1',
        tutorId: 'tutor1',
        status: 'confirmed',
      });

      await expect(
        service.confirmByTutor({ uid: 'tutor1' }, 'session1', { scheduledAt: '2024-01-20T14:00:00Z' })
      ).rejects.toThrow('Session not in requested state');
    });

    it('should update session to confirmed', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session1',
        tutorId: 'tutor1',
        status: 'requested',
        topic: 'Math',
      });
      mockSessionsRepo.update.mockResolvedValue();

      const result = await service.confirmByTutor(
        { uid: 'tutor1' },
        'session1',
        { scheduledAt: '2024-01-20T14:00:00Z' }
      );

      expect(mockSessionsRepo.update).toHaveBeenCalledWith(
        'session1',
        expect.objectContaining({
          status: 'confirmed',
          scheduledAt: '2024-01-20T14:00:00Z',
        })
      );
      expect(result.status).toBe('confirmed');
      expect(result.scheduledAt).toBe('2024-01-20T14:00:00Z');
    });
  });

  describe('markDoneByStudent', () => {
    it('should throw error if session not found', async () => {
      mockSessionsRepo.getById.mockResolvedValue(null);

      await expect(
        service.markDoneByStudent({ uid: 'student1' }, 'session1')
      ).rejects.toThrow('Session not found');
    });

    it('should throw error if not student session', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session1',
        studentId: 'student2',
        status: 'confirmed',
      });

      await expect(
        service.markDoneByStudent({ uid: 'student1' }, 'session1')
      ).rejects.toThrow('Not your session');
    });

    it('should throw error if session not confirmed', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session1',
        studentId: 'student1',
        status: 'requested',
      });

      await expect(
        service.markDoneByStudent({ uid: 'student1' }, 'session1')
      ).rejects.toThrow('Session not confirmed');
    });

    it('should mark session as done', async () => {
      mockSessionsRepo.getById.mockResolvedValue({
        id: 'session1',
        studentId: 'student1',
        status: 'confirmed',
        topic: 'Chemistry',
      });
      mockSessionsRepo.update.mockResolvedValue();

      const result = await service.markDoneByStudent({ uid: 'student1' }, 'session1');

      expect(mockSessionsRepo.update).toHaveBeenCalledWith(
        'session1',
        expect.objectContaining({ status: 'done' })
      );
      expect(result.status).toBe('done');
      expect(result.doneAt).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should call sessionsRepo.getById', async () => {
      mockSessionsRepo.getById.mockResolvedValue({ id: 'session1', topic: 'Math' });

      const result = await service.getById('session1');

      expect(mockSessionsRepo.getById).toHaveBeenCalledWith('session1');
      expect(result).toEqual({ id: 'session1', topic: 'Math' });
    });
  });
});
