import { LoginButton } from '../features/auth/components/LoginButton';
import './LoginPage.css';

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Tsundoku & Dragons</h1>
        <p className="tagline">Conquer your reading backlog!</p>
        <div className="login-buttons">
          <LoginButton provider="google" className="login-button google" />
        </div>
      </div>
    </div>
  );
}
