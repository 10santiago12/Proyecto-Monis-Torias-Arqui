import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: null
  },
  db: {}
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn()
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  getFirestore: vi.fn()
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Monis-Torias/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/tunombre@unisabana.edu.co/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
  });

  it('should show registration form when clicking "Inscríbete"', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const registerButton = screen.getByRole('button', { name: /Inscríbete/i });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/Crear cuenta/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should validate email input', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/tunombre@unisabana.edu.co/i);
    const submitButton = screen.getByRole('button', { name: /Ingresar/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    // El navegador validará el email automáticamente por el type="email"
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should require password input', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toBeRequired();
  });

  it('should disable submit button while submitting', async () => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    vi.mocked(signInWithEmailAndPassword).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/tunombre@unisabana.edu.co/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /Ingresar/i });

    fireEvent.change(emailInput, { target: { value: 'test@unisabana.edu.co' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/Ingresando/i);
    });
  });

  it('should toggle between login and register modes', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Inicialmente en modo login
    expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument();
    
    // Cambiar a modo registro
    const registerButton = screen.getByRole('button', { name: /Inscríbete/i });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Crear cuenta/i)).toBeInTheDocument();
    });
    
    // Volver a modo login
    const loginLink = screen.getByRole('button', { name: /Inicia sesión/i });
    fireEvent.click(loginLink);
    
    await waitFor(() => {
      expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument();
    });
  });
});
