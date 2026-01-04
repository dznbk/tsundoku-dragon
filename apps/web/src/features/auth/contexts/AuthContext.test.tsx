import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

// Use vi.hoisted to define mocks that vi.mock can reference
const { mockUser, mockSignInWithPopup, mockSignOut } = vi.hoisted(() => {
  return {
    mockUser: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    },
    mockSignInWithPopup: vi.fn(),
    mockSignOut: vi.fn(),
  };
});

vi.mock('firebase/auth', () => {
  let authStateCallback: ((user: unknown) => void) | null = null;
  return {
    onAuthStateChanged: vi.fn((_auth, callback) => {
      authStateCallback = callback;
      callback(null);
      return vi.fn();
    }),
    signInWithPopup: mockSignInWithPopup,
    signOut: mockSignOut,
    GoogleAuthProvider: vi.fn(),
    // Export for tests to use
    __getCallback: () => authStateCallback,
  };
});

vi.mock('../../../lib/firebase', () => ({
  auth: {},
}));

function TestComponent() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  return (
    <div>
      <p data-testid="loading">{loading ? 'loading' : 'ready'}</p>
      <p data-testid="user">{user ? user.displayName : 'no user'}</p>
      <button onClick={signInWithGoogle}>Login</button>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithPopup.mockResolvedValue({ user: mockUser });
    mockSignOut.mockResolvedValue(undefined);
  });

  it('provides loading state initially', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
  });

  it('provides null user when not authenticated', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no user');
    });
  });

  it('calls signInWithPopup when signInWithGoogle is called', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    await user.click(screen.getByText('Login'));

    expect(mockSignInWithPopup).toHaveBeenCalled();
  });

  it('calls signOut when signOut is called', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    await user.click(screen.getByText('Logout'));

    expect(mockSignOut).toHaveBeenCalled();
  });
});
