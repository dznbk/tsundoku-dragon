import { useState, useRef, useId } from 'react';
import styles from './SkillTagInput.module.css';

interface SkillTagInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  suggestions: string[];
  isLoadingSuggestions: boolean;
}

export function SkillTagInput({
  value,
  onChange,
  suggestions,
  isLoadingSuggestions,
}: SkillTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(s)
  );

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue('');
    setActiveIndex(-1);
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
        addSkill(filteredSuggestions[activeIndex]);
      } else if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    // 少し遅延させてクリックイベントが発火できるようにする
    setTimeout(() => {
      setIsOpen(false);
      setActiveIndex(-1);
    }, 150);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tagsWrapper}>
        {value.map((skill) => (
          <span key={skill} className={styles.tag}>
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className={styles.removeButton}
              aria-label={`${skill}を削除`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={styles.input}
          placeholder={value.length === 0 ? 'スキルを追加...' : ''}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
        />
      </div>

      {isOpen && (filteredSuggestions.length > 0 || isLoadingSuggestions) && (
        <ul id={listboxId} role="listbox" className={styles.suggestions}>
          {isLoadingSuggestions ? (
            <li className={styles.loading}>読込中...</li>
          ) : (
            filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`${styles.suggestion} ${index === activeIndex ? styles.active : ''}`}
                onClick={() => addSkill(suggestion)}
              >
                {suggestion}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
