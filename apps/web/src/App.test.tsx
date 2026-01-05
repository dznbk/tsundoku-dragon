import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    // Simulate immediate auth state change (not logged in)
    setTimeout(() => callback(null), 0);
    return vi.fn();
  }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock('./lib/firebase', () => ({
  auth: {},
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the login page when not authenticated', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByAltText('積ん読＆ドラゴンズ')).toBeInTheDocument();
      expect(screen.getByText('積ん読を討伐せよ！')).toBeInTheDocument();
      expect(screen.getByText('Googleでログイン')).toBeInTheDocument();
    });
  });
});
