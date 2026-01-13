import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: 'reading' | 'completed' | 'archived';
}

const statusLabels: Record<StatusBadgeProps['status'], string> = {
  reading: '戦闘中',
  completed: '討伐済み',
  archived: '封印',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
