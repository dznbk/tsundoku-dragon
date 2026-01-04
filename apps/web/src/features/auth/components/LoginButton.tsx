import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LoginButtonProps {
  provider: 'google';
  className?: string;
}

export function LoginButton({ provider, className }: LoginButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Logging in...';
    if (provider === 'google') return 'Sign in with Google';
    return 'Sign in';
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className}
        type="button"
      >
        {getButtonText()}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
