import { useState, type FormEvent } from 'react';
import { DQButton } from '../../../components/DQButton';
import styles from './BattleInput.module.css';

interface BattleInputProps {
  remainingPages: number;
  onAttack: (pagesRead: number, memo?: string) => void;
  disabled?: boolean;
}

export function BattleInput({
  remainingPages,
  onAttack,
  disabled = false,
}: BattleInputProps) {
  const [pagesRead, setPagesRead] = useState<string>('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pages = parseInt(pagesRead, 10);
    if (isNaN(pages) || pages < 1) return;

    // 残りページ数を超えた場合は自動補正
    const actualPages = Math.min(pages, remainingPages);
    onAttack(actualPages, memo || undefined);
  };

  const handlePagesChange = (value: string) => {
    // 空文字または数字のみ許可
    if (value === '' || /^\d+$/.test(value)) {
      setPagesRead(value);
    }
  };

  const parsedPages = parseInt(pagesRead, 10);
  const isValidPages = !isNaN(parsedPages) && parsedPages >= 1;
  const willAutoCorrect =
    isValidPages && parsedPages > remainingPages && remainingPages > 0;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.inputGroup}>
        <label htmlFor="pagesRead" className={styles.label}>
          読んだページ数
        </label>
        <input
          id="pagesRead"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pagesRead}
          onChange={(e) => handlePagesChange(e.target.value)}
          placeholder="50"
          className={styles.input}
          disabled={disabled}
          aria-describedby={willAutoCorrect ? 'autoCorrectHint' : undefined}
        />
        {willAutoCorrect && (
          <p id="autoCorrectHint" className={styles.hint}>
            ※ 残りページ数（{remainingPages}）に自動補正されます
          </p>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="memo" className={styles.label}>
          メモ（任意）
        </label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="今日読んだ感想など..."
          className={styles.textarea}
          rows={3}
          maxLength={1000}
          disabled={disabled}
        />
      </div>

      <DQButton
        type="submit"
        disabled={disabled || !isValidPages || remainingPages === 0}
        className={styles.attackButton}
      >
        こうげき
      </DQButton>
    </form>
  );
}
