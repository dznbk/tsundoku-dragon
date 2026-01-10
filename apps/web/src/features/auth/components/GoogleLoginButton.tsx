import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import styles from './GoogleLoginButton.module.css';

interface GoogleLoginButtonProps {
  className?: string;
}

export function GoogleLoginButton({ className }: GoogleLoginButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={styles.button}
        type="button"
        aria-label="Googleでログイン"
      >
        <span className={styles.logoContainer}>
          <img
            src="/assets/google-g-logo.svg"
            alt=""
            className={styles.logo}
            aria-hidden="true"
          />
        </span>
        <span className={styles.text}>
          {loading ? 'ログイン中...' : 'Googleでログイン'}
        </span>
      </button>
      {error && (
        <p className={styles.error} role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
}
