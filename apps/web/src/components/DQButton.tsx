import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './DQButton.module.css';

interface DQButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function DQButton({
  children,
  variant = 'primary',
  className,
  ...props
}: DQButtonProps) {
  const combinedClassName = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}
