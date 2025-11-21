const { TutorsService } = require('../../../src/services/tutors.service');

describe('TutorsService', () => {
  let service;
  let mockTutorsRepo;

  beforeEach(() => {
    mockTutorsRepo = {
      listAll: jest.fn(),
      createCode: jest.fn(),
      claimCode: jest.fn(),
      ensureTutorProfile: jest.fn(),
    };

    service = new TutorsService({ repo: mockTutorsRepo });
  });

  describe('listAllTutors', () => {
    it('should call repo.listAll', async () => {
      const tutors = [
        { uid: 'tutor1', email: 'tutor1@test.com' },
        { uid: 'tutor2', email: 'tutor2@test.com' },
      ];
      mockTutorsRepo.listAll.mockResolvedValue(tutors);

      const result = await service.listAllTutors();

      expect(mockTutorsRepo.listAll).toHaveBeenCalled();
      expect(result).toEqual(tutors);
    });

    it('should return empty array if no tutors', async () => {
      mockTutorsRepo.listAll.mockResolvedValue([]);

      const result = await service.listAllTutors();

      expect(result).toEqual([]);
    });
  });

  describe('assignCodeToTutor', () => {
    it('should create code, claim it, and ensure tutor profile', async () => {
      const code = { code: 'ABC123', createdBy: 'manager1' };
      mockTutorsRepo.createCode.mockResolvedValue(code);
      mockTutorsRepo.claimCode.mockResolvedValue();
      mockTutorsRepo.ensureTutorProfile.mockResolvedValue();

      const result = await service.assignCodeToTutor('manager1', 'tutor1', 'Test assignment');

      expect(mockTutorsRepo.createCode).toHaveBeenCalledWith('manager1', 'Test assignment');
      expect(mockTutorsRepo.claimCode).toHaveBeenCalledWith('tutor1', 'ABC123');
      expect(mockTutorsRepo.ensureTutorProfile).toHaveBeenCalledWith(
        'tutor1',
        expect.objectContaining({
          role: 'tutor',
          code: 'ABC123',
        })
      );
      expect(result).toEqual({ code: 'ABC123', uid: 'tutor1' });
    });

    it('should work with empty note', async () => {
      const code = { code: 'XYZ789', createdBy: 'manager1' };
      mockTutorsRepo.createCode.mockResolvedValue(code);
      mockTutorsRepo.claimCode.mockResolvedValue();
      mockTutorsRepo.ensureTutorProfile.mockResolvedValue();

      const result = await service.assignCodeToTutor('manager1', 'tutor2', '');

      expect(mockTutorsRepo.createCode).toHaveBeenCalledWith('manager1', '');
      expect(result.code).toBe('XYZ789');
    });

    it('should propagate errors from repo', async () => {
      mockTutorsRepo.createCode.mockRejectedValue(new Error('Database error'));

      await expect(
        service.assignCodeToTutor('manager1', 'tutor3', 'Assignment')
      ).rejects.toThrow('Database error');
    });
  });
});
