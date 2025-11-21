const request = require('supertest');
const express = require('express');
const admin = require('firebase-admin');

// Mock Firebase Admin before requiring routes
jest.mock('firebase-admin');

// Create Express app for testing (without Firebase Functions wrapper)
const app = express();
const cors = require('cors');

app.use(cors({ origin: true }));
app.use(express.json());

// Import routes
const sessionsRoutes = require('../../src/api/sessions.routes');
const paymentsRoutes = require('../../src/api/payments.routes');
const tutorsRoutes = require('../../src/api/tutors.routes');
const { errorMiddleware } = require('../../src/middlewares/error.middleware');

// Mount routes
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/sessions', sessionsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/tutors', tutorsRoutes);
app.use(errorMiddleware);

describe('API Integration Tests', () => {
  let mockAuth;
  let mockFirestore;
  let mockDb;

  beforeAll(() => {
    // Setup Firebase Admin mocks
    mockFirestore = {
      collection: jest.fn(),
      doc: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      add: jest.fn(),
      where: jest.fn(),
    };

    mockAuth = {
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
    };

    mockDb = {
      collection: jest.fn(() => mockFirestore),
    };

    admin.auth = jest.fn(() => mockAuth);
    admin.firestore = jest.fn(() => mockDb);
    admin.apps = [{ name: '[DEFAULT]' }];
    admin.initializeApp = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('GET /health should return ok', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ok: true });
    });
  });

  describe('Authentication', () => {
    it('should return 401 for protected routes without token', async () => {
      const response = await request(app)
        .post('/sessions/request')
        .send({ tutorCode: '1234', topic: 'Math' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for invalid token', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/sessions/request')
        .set('Authorization', 'Bearer invalid-token')
        .send({ tutorCode: '1234', topic: 'Math' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized');
    });
  });

  describe('Sessions Endpoints', () => {
    const validToken = 'valid-mock-token';
    const mockUser = { uid: 'student123', email: 'student@test.com' };

    beforeEach(() => {
      mockAuth.verifyIdToken.mockResolvedValue(mockUser);
      mockDb.collection.mockImplementation((col) => {
        if (col === 'user_roles') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({ exists: false }),
            })),
          };
        }
        return {
          doc: jest.fn(() => ({
            get: jest.fn().mockResolvedValue({ exists: false }),
          })),
        };
      });
    });

    it('POST /sessions/request should create session with valid data', async () => {
      // Mock tutor code lookup and session creation
      mockDb.collection.mockImplementation((col) => {
        if (col === 'tutor_codes') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ claimedBy: 'tutor123', active: false }),
              }),
            })),
          };
        }
        if (col === 'sessions') {
          return {
            add: jest.fn().mockResolvedValue({ id: 'session123' }),
          };
        }
        if (col === 'user_roles') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({ exists: false }),
            })),
          };
        }
        return mockFirestore;
      });

      const response = await request(app)
        .post('/sessions/request')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          tutorCode: '1234',
          topic: 'Math',
          description: 'Help with calculus',
          durationMin: 60,
          currency: 'USD',
          price: 50,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('POST /sessions/request should return 400 for validation errors', async () => {
      mockDb.collection.mockImplementation((col) => {
        if (col === 'user_roles') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({ exists: false }),
            })),
          };
        }
        return mockFirestore;
      });

      const response = await request(app)
        .post('/sessions/request')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          tutorCode: '1234',
          // Missing required 'topic' field
          durationMin: 60,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('GET /sessions should list sessions for authenticated user', async () => {
      mockDb.collection.mockImplementation((col) => {
        if (col === 'sessions') {
          return {
            where: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                docs: [
                  {
                    id: 's1',
                    data: () => ({ topic: 'Math', status: 'requested' }),
                  },
                ],
              }),
            })),
          };
        }
        if (col === 'user_roles') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({ exists: false }),
            })),
          };
        }
        return mockFirestore;
      });

      const response = await request(app)
        .get('/sessions')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Payments Endpoints', () => {
    const validToken = 'valid-mock-token';
    const mockUser = { uid: 'tutor123', roles: { tutor: true } };

    beforeEach(() => {
      mockAuth.verifyIdToken.mockResolvedValue(mockUser);
    });

    it('POST /payments/request should create payment request', async () => {
      mockDb.collection.mockImplementation((col) => {
        if (col === 'sessions') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                id: 'session123',
                data: () => ({
                  status: 'done',
                  tutorId: 'tutor123',
                  price: 100,
                  currency: 'USD',
                }),
              }),
            })),
          };
        }
        if (col === 'payments') {
          return {
            add: jest.fn().mockResolvedValue({ id: 'payment123' }),
          };
        }
        if (col === 'user_roles') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ tutor: true }),
              }),
            })),
          };
        }
        return mockFirestore;
      });

      const response = await request(app)
        .post('/payments/request')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ sessionId: 'session123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('POST /payments/request should return 403 without tutor role', async () => {
      const studentUser = { uid: 'student123', email: 'student@test.com' };
      mockAuth.verifyIdToken.mockResolvedValue(studentUser);
      mockDb.collection.mockImplementation((col) => {
        if (col === 'user_roles') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ student: true }), // Not a tutor
              }),
            })),
          };
        }
        return mockFirestore;
      });

      const response = await request(app)
        .post('/payments/request')
        .set('Authorization', 'Bearer student-token')
        .send({ sessionId: 'session123' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });
  });

  describe('Tutors Endpoints', () => {
    const validToken = 'valid-mock-token';
    const mockManager = { uid: 'manager123', roles: { manager: true } };

    beforeEach(() => {
      mockAuth.verifyIdToken.mockResolvedValue(mockManager);
    });

    it('POST /tutors/:uid/assign-code should assign code to tutor', async () => {
      mockDb.collection.mockImplementation((col) => {
        if (col === 'tutor_codes') {
          return {
            doc: jest.fn((code) => ({
              get: jest.fn().mockResolvedValue({ exists: false }),
              set: jest.fn().mockResolvedValue(),
              update: jest.fn().mockResolvedValue(),
            })),
          };
        }
        if (col === 'tutors') {
          return {
            doc: jest.fn(() => ({
              set: jest.fn().mockResolvedValue(),
            })),
          };
        }
        if (col === 'user_roles') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ manager: true }),
              }),
            })),
          };
        }
        return mockFirestore;
      });

      const response = await request(app)
        .post('/tutors/tutor123/assign-code')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ note: 'New tutor assignment' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('uid', 'tutor123');
    });

    it('GET /tutors should list all tutors for manager', async () => {
      mockDb.collection.mockImplementation((col) => {
        if (col === 'tutors') {
          return {
            get: jest.fn().mockResolvedValue({
              forEach: (callback) => {
                callback({
                  id: 'tutor1',
                  data: () => ({ email: 'tutor1@test.com' }),
                });
              },
            }),
          };
        }
        if (col === 'user_roles') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ manager: true }),
              }),
            })),
          };
        }
        return mockFirestore;
      });

      const response = await request(app)
        .get('/tutors')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /tutors should return 403 without manager role', async () => {
      const studentUser = { uid: 'student123', email: 'student@test.com' };
      mockAuth.verifyIdToken.mockResolvedValue(studentUser);
      mockDb.collection.mockImplementation((col) => {
        if (col === 'user_roles') {
          return {
            doc: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({
                exists: true,
                data: () => ({ student: true }), // Not a manager
              }),
            })),
          };
        }
        return mockFirestore;
      });

      const response = await request(app)
        .get('/tutors')
        .set('Authorization', 'Bearer student-token');

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Forbidden');
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'user123' });

      const response = await request(app)
        .post('/sessions/request')
        .set('Authorization', 'Bearer valid-token')
        .send({
          // Missing required fields
          topic: 'Math',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle internal server errors gracefully', async () => {
      mockAuth.verifyIdToken.mockResolvedValue({ uid: 'user123' });
      mockDb.collection.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/sessions')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
