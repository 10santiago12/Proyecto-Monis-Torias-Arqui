import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';

// Mock de useAuth
const mockUseAuth = vi.fn();
vi.mock('../../hooks/useAuth', async () => {
  const actual = await vi.importActual('../../hooks/useAuth');
  return {
    ...actual,
    useAuth: () => mockUseAuth()
  };
});

// Mock de api service
vi.mock('../../services/api', () => ({
  api: {
    getSessions: vi.fn(() => Promise.resolve([]))
  }
}));

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-uid', email: 'test@test.com' }
  },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback({ uid: 'test-uid', email: 'test@test.com' });
    return () => {};
  }),
  getAuth: vi.fn()
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@test.com' },
      loading: false,
      logout: vi.fn()
    });
  });

  it('should render dashboard with empty state', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Monis-Torias/i)).toBeInTheDocument();
      expect(screen.getByText(/Tus sesiones/i)).toBeInTheDocument();
    });
  });

  it('should show loading skeleton initially', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-uid', email: 'test@test.com' },
      loading: true,
      logout: vi.fn()
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Monis-Torias/i)).toBeInTheDocument();
  });

  it('should display "Crear sesión" button', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Crear sesión/i)).toBeInTheDocument();
    });
  });

  it('should display "Cerrar sesión" button', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cerrar sesión/i })).toBeInTheDocument();
    });
  });

  it('should show empty state for confirmed sessions', async () => {
    const { api } = await import('../../services/api');
    vi.mocked(api.getSessions).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No tienes sesiones confirmadas próximas/i)).toBeInTheDocument();
    });
  });

  it('should show empty state for pending sessions', async () => {
    const { api } = await import('../../services/api');
    vi.mocked(api.getSessions).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No tienes solicitudes pendientes/i)).toBeInTheDocument();
    });
  });

  it('should display confirmed sessions', async () => {
    const mockSessions = [
      {
        id: '1',
        status: 'confirmed',
        topic: 'Matemáticas',
        durationMin: 60,
        scheduledAt: new Date(Date.now() + 86400000).toISOString() // Mañana
      }
    ];

    const { api } = await import('../../services/api');
    vi.mocked(api.getSessions).mockResolvedValue(mockSessions);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Matemáticas/i)).toBeInTheDocument();
      expect(screen.getByText(/60 min/i)).toBeInTheDocument();
    });
  });

  it('should display pending sessions', async () => {
    const mockSessions = [
      {
        id: '2',
        status: 'requested',
        topic: 'Física',
        durationMin: 45,
        preferredAt: new Date().toISOString()
      }
    ];

    const { api } = await import('../../services/api');
    vi.mocked(api.getSessions).mockResolvedValue(mockSessions);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Física/i)).toBeInTheDocument();
      expect(screen.getByText(/45 min/i)).toBeInTheDocument();
    });
  });

  it('should show session count badges', async () => {
    const { api } = await import('../../services/api');
    vi.mocked(api.getSessions).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const badges = screen.getAllByText('0');
      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
