import { useState } from 'react';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { useAuth } from './features/auth/hooks/useAuth';
import { DQWindow } from './components/DQWindow';
import LoginPage from './pages/LoginPage';
import { BookRegisterPage } from './pages/BookRegisterPage';
import { HomePage } from './pages/HomePage';
import { BookDetailPage } from './pages/BookDetailPage';
import styles from './App.module.css';

type Page = 'home' | 'book-register' | 'book-detail';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

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

  if (currentPage === 'book-detail' && selectedBookId) {
    return (
      <BookDetailPage
        bookId={selectedBookId}
        onBack={() => {
          setCurrentPage('home');
          setSelectedBookId(null);
        }}
        onNavigateToBattle={(bookId) => {
          // TODO: 戦闘画面への遷移（別Issue）
          console.log('Navigate to battle:', bookId);
        }}
      />
    );
  }

  const handleBookClick = (bookId: string) => {
    setSelectedBookId(bookId);
    setCurrentPage('book-detail');
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
        <HomePage
          onNavigateToRegister={() => setCurrentPage('book-register')}
          onBookClick={handleBookClick}
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
