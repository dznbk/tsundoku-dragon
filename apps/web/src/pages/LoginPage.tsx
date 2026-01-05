import { LoginButton } from '../features/auth/components/LoginButton';
import { DQWindow } from '../components/DQWindow';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <DQWindow className={styles.container}>
        <img
          src="/assets/logo.png"
          alt="積読＆ドラゴンズ"
          className={styles.logo}
        />
        <p className={styles.tagline}>積読を討伐せよ！</p>
        <div className={styles.buttons}>
          <LoginButton provider="google" className={styles.loginButton} />
        </div>
      </DQWindow>
    </div>
  );
}
