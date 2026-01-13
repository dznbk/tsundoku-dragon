import type { ReactNode } from 'react';
import styles from './BottomActionBar.module.css';

interface BottomActionBarProps {
  children: ReactNode;
}

export function BottomActionBar({ children }: BottomActionBarProps) {
  return (
    <>
      <div className={styles.spacer} aria-hidden="true" />
      <div className={styles.bar}>{children}</div>
    </>
  );
}
