import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../services/api';

// Mock global fetch
global.fetch = vi.fn();

// Mock Firebase auth
vi.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn(() => Promise.resolve('mock-token'))
    }
  }
}));

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make GET request to /health', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true })
    } as Response);

    const result = await api.getHealth();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/health'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token'
        })
      })
    );
    expect(result).toEqual({ ok: true });
  });

  it('should make GET request to /sessions', async () => {
    const mockSessions = [
      { id: '1', topic: 'Math', status: 'confirmed' }
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockSessions
    } as Response);

    const result = await api.getSessions();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/sessions'),
      expect.any(Object)
    );
    expect(result).toEqual(mockSessions);
  });

  it('should make POST request to create session', async () => {
    const sessionData = {
      tutorCode: '1234',
      topic: 'Matemáticas',
      description: 'Ayuda con álgebra',
      durationMin: 60
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: 'new-session-id', ...sessionData })
    } as Response);

    const result = await api.createSession(sessionData);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/sessions/request'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(sessionData)
      })
    );
    expect(result).toHaveProperty('id');
  });

  it('should handle API errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized'
    } as Response);

    await expect(api.getHealth()).rejects.toThrow();
  });

  it('should include Authorization header when token exists', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({})
    } as Response);

    await api.getHealth();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer mock-token'
        })
      })
    );
  });

  it('should make POST request to confirm session', async () => {
    const sessionId = 'test-session-id';
    const scheduledAt = new Date().toISOString();

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ id: sessionId, status: 'confirmed' })
    } as Response);

    const result = await api.confirmSession(sessionId, scheduledAt);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/sessions/${sessionId}/confirm`),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ scheduledAt })
      })
    );
    expect(result).toHaveProperty('status', 'confirmed');
  });

  it('should fetch tutors list', async () => {
    const mockTutors = [
      { uid: 'tutor1', name: 'Tutor 1' }
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockTutors
    } as Response);

    const result = await api.getTutors();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/tutors'),
      expect.any(Object)
    );
    expect(result).toEqual(mockTutors);
  });
});
