import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoogleLoginButton } from './GoogleLoginButton';

const mockSignInWithGoogle = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
  }),
}));

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithGoogle.mockResolvedValue(undefined);
  });

  it('renders Google login button', () => {
    render(<GoogleLoginButton />);

    expect(
      screen.getByRole('button', { name: 'Googleでログイン' })
    ).toBeInTheDocument();
    expect(screen.getByText('Googleでログイン')).toBeInTheDocument();
  });

  it('renders Google logo', () => {
    const { container } = render(<GoogleLoginButton />);

    const logo = container.querySelector('img');
    expect(logo).toHaveAttribute('src', '/assets/google-g-logo.svg');
  });

  it('calls signInWithGoogle when clicked', async () => {
    const user = userEvent.setup();

    render(<GoogleLoginButton />);

    await user.click(screen.getByRole('button', { name: 'Googleでログイン' }));

    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it('shows loading state while logging in', async () => {
    const user = userEvent.setup();
    mockSignInWithGoogle.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<GoogleLoginButton />);

    await user.click(screen.getByRole('button', { name: 'Googleでログイン' }));

    expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows error message when login fails', async () => {
    const user = userEvent.setup();
    mockSignInWithGoogle.mockRejectedValue(new Error('ログインエラー'));

    render(<GoogleLoginButton />);

    await user.click(screen.getByRole('button', { name: 'Googleでログイン' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('ログインエラー');
    });
  });

  it('shows generic error message when error is not an Error instance', async () => {
    const user = userEvent.setup();
    mockSignInWithGoogle.mockRejectedValue('unknown error');

    render(<GoogleLoginButton />);

    await user.click(screen.getByRole('button', { name: 'Googleでログイン' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'ログインに失敗しました'
      );
    });
  });

  it('applies custom className', () => {
    const { container } = render(
      <GoogleLoginButton className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
