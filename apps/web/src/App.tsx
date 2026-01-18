import { useState } from 'react';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { useAuth } from './features/auth/hooks/useAuth';
import { DQWindow } from './components/DQWindow';
import LoginPage from './pages/LoginPage';
import { BookRegisterPage } from './pages/BookRegisterPage';
import { BookDetailPage } from './pages/BookDetailPage';
import { HomePage } from './pages/HomePage';
import styles from './App.module.css';

type Page = 'home' | 'book-register' | 'book-detail';

interface PageState {
  page: Page;
  bookId?: string;
}

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [pageState, setPageState] = useState<PageState>({ page: 'home' });

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

  const navigateToHome = () => setPageState({ page: 'home' });
  const navigateToRegister = () => setPageState({ page: 'book-register' });
  const navigateToBookDetail = (bookId: string) =>
    setPageState({ page: 'book-detail', bookId });
  const navigateToBattle = (_bookId: string) => {
    // 戦闘画面は未実装
    alert('戦闘画面は今後実装予定です');
  };

  if (pageState.page === 'book-register') {
    return <BookRegisterPage onBack={navigateToHome} />;
  }

  if (pageState.page === 'book-detail' && pageState.bookId) {
    return (
      <BookDetailPage
        bookId={pageState.bookId}
        onBack={navigateToHome}
        onNavigateToBattle={navigateToBattle}
      />
    );
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
          onNavigateToRegister={navigateToRegister}
          onNavigateToBookDetail={navigateToBookDetail}
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
