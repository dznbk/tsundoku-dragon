import { useState } from 'react';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { useAuth } from './features/auth/hooks/useAuth';
import { DQWindow } from './components/DQWindow';
import LoginPage from './pages/LoginPage';
import { BookRegisterPage } from './pages/BookRegisterPage';
import { HomePage } from './pages/HomePage';
import styles from './App.module.css';

type Page = 'home' | 'book-register';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');

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

  if (currentPage === 'book-register') {
    return <BookRegisterPage onBack={() => setCurrentPage('home')} />;
  }

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
        <HomePage
          onNavigateToRegister={() => setCurrentPage('book-register')}
        />
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
