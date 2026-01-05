import type { ReactNode } from 'react';
import styles from './DQWindow.module.css';

interface DQWindowProps {
  children: ReactNode;
  className?: string;
}

export function DQWindow({ children, className }: DQWindowProps) {
  const combinedClassName = className
    ? `${styles.window} ${className}`
    : styles.window;

  return <div className={combinedClassName}>{children}</div>;
}
