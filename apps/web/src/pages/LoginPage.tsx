import { GoogleLoginButton } from '../features/auth/components/GoogleLoginButton';
import { DQWindow } from '../components/DQWindow';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <DQWindow className={styles.container}>
        <img
          src="/assets/logo.png"
          alt="積ん読＆ドラゴンズ"
          className={styles.logo}
        />
        <p className={styles.tagline}>積ん読を討伐せよ！</p>
        <div className={styles.buttons}>
          <GoogleLoginButton />
        </div>
      </DQWindow>
    </div>
  );
}
