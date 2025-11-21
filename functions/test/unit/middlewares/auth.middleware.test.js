// Mock firebase-admin BEFORE requiring middleware
jest.mock('firebase-admin', () => {
  return {
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn(),
    })),
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
        })),
      })),
    })),
    initializeApp: jest.fn(),
  };
});

const { authMiddleware } = require('../../../src/middlewares/auth.middleware');
const admin = require('firebase-admin');

describe('authMiddleware', () => {
  let req, res, next;
  let mockVerifyIdToken;
  let mockGet;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();

    mockVerifyIdToken = jest.fn();
    mockGet = jest.fn();

    admin.auth.mockReturnValue({
      verifyIdToken: mockVerifyIdToken,
    });

    admin.firestore.mockReturnValue({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: mockGet,
        })),
      })),
    });
  });

  it('should return 401 if no authorization header', async () => {
    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing bearer token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header is malformed', async () => {
    req.headers.authorization = 'InvalidFormat token123';

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing bearer token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token verification fails', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    mockVerifyIdToken.mockRejectedValue(new Error('Token invalid'));

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach user with roles from token and call next', async () => {
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyIdToken.mockResolvedValue({
      uid: 'user123',
      roles: { student: true },
    });

    await authMiddleware(req, res, next);

    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(req.user).toEqual({
      uid: 'user123',
      roles: { student: true },
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should fetch roles from Firestore if not in token', async () => {
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyIdToken.mockResolvedValue({ uid: 'user456' });
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ tutor: true }),
    });

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({
      uid: 'user456',
      roles: { tutor: true },
    });
    expect(next).toHaveBeenCalled();
  });

  it('should use empty roles if not in token or Firestore', async () => {
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyIdToken.mockResolvedValue({ uid: 'user789' });
    mockGet.mockResolvedValue({ exists: false });

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({
      uid: 'user789',
      roles: {},
    });
    expect(next).toHaveBeenCalled();
  });

  it('should handle Firestore errors gracefully', async () => {
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyIdToken.mockResolvedValue({ uid: 'userError' });
    mockGet.mockRejectedValue(new Error('Firestore error'));

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({
      uid: 'userError',
      roles: {},
    });
    expect(next).toHaveBeenCalled();
  });
});
