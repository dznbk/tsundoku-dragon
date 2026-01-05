import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import styles from './LoginButton.module.css';

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
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'ログイン中...';
    if (provider === 'google') return 'Googleでログイン';
    return 'ログイン';
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
      {error && (
        <p className={styles.error} role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
}
