import { AuthProvider } from './features/auth/contexts/AuthContext';
import { useAuth } from './features/auth/hooks/useAuth';
import LoginPage from './pages/LoginPage';
import './App.css';

function AppContent() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
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
    <div className="app">
      <header className="app-header">
        <h1>Tsundoku & Dragons</h1>
        <div className="user-info">
          <span>{user.displayName || user.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main>
        <p>Welcome, {user.displayName || 'Adventurer'}!</p>
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
