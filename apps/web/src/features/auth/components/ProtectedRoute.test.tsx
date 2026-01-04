import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

const createMockContextValue = (
  overrides: Partial<AuthContextValue> = {}
): AuthContextValue => ({
  user: null,
  loading: false,
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  ...overrides,
});

describe('ProtectedRoute', () => {
  it('shows loading state when loading is true', () => {
    const mockValue = createMockContextValue({ loading: true });

    render(
      <AuthContext.Provider value={mockValue}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    } as AuthContextValue['user'];

    const mockValue = createMockContextValue({ user: mockUser });

    render(
      <AuthContext.Provider value={mockValue}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders nothing when user is not authenticated and no fallback', () => {
    const mockValue = createMockContextValue({ user: null });

    const { container } = render(
      <AuthContext.Provider value={mockValue}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('renders fallback when user is not authenticated', () => {
    const mockValue = createMockContextValue({ user: null });

    render(
      <AuthContext.Provider value={mockValue}>
        <ProtectedRoute fallback={<div>Please login</div>}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Please login')).toBeInTheDocument();
  });
});
