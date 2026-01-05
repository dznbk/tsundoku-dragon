import { AuthProvider } from './features/auth/contexts/AuthContext';
import { useAuth } from './features/auth/hooks/useAuth';
import { DQWindow } from './components/DQWindow';
import LoginPage from './pages/LoginPage';
import styles from './App.module.css';

function AppContent() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className={styles.loading}>読み込み中...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={styles.app}>
      <DQWindow className={styles.header}>
        <a href="/" className={styles.logoLink} aria-label="ホームに戻る">
          <img
            src="/assets/logo.png"
            alt="積ん読＆ドラゴンズ"
            className={styles.logo}
          />
        </a>
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {user.displayName || user.email}
          </span>
          <button
            onClick={handleLogout}
            className={styles.logoutButton}
            type="button"
          >
            ログアウト
          </button>
        </div>
      </DQWindow>
      <main className={styles.main}>
        <p className={styles.welcome}>
          ようこそ、{user.displayName || '冒険者'}！
        </p>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
