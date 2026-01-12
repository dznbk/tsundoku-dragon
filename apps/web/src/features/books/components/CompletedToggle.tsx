import styles from './CompletedToggle.module.css';

interface CompletedToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CompletedToggle({ checked, onChange }: CompletedToggleProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <label className={styles.container}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className={styles.checkbox}
      />
      <span className={styles.label}>討伐済みも表示する</span>
    </label>
  );
}
