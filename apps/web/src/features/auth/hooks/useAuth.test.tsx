import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock Firebase before importing AuthContext
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

vi.mock('../../../lib/firebase', () => ({
  auth: {},
}));

import { AuthContext, type AuthContextValue } from '../contexts/AuthContext';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('throws error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('returns context value when used within AuthProvider', () => {
    const mockValue: AuthContextValue = {
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(mockValue);
  });
});
