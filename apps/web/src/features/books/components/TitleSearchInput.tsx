import { useState, useRef, useId, useEffect } from 'react';
import type { NdlBookSearchResult } from '../services/ndlApi';
import { useTitleSearch } from '../hooks/useTitleSearch';
import styles from './TitleSearchInput.module.css';

interface TitleSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: NdlBookSearchResult) => void;
  error?: string;
}

export function TitleSearchInput({
  value,
  onChange,
  onSelect,
  error,
}: TitleSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const { searchResults, isSearching, searchTitle, clearResults } =
    useTitleSearch();

  useEffect(() => {
    searchTitle(value);
  }, [value, searchTitle]);

  const handleSelect = (result: NdlBookSearchResult) => {
    onChange(result.title);
    onSelect(result);
    setIsOpen(false);
    setActiveIndex(-1);
    clearResults();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (
      e.key === 'Enter' &&
      activeIndex >= 0 &&
      searchResults[activeIndex]
    ) {
      e.preventDefault();
      handleSelect(searchResults[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleFocus = () => {
    if (searchResults.length > 0 || isSearching) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setActiveIndex(-1);
    }, 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const showDropdown = isOpen && (searchResults.length > 0 || isSearching);

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? 'title-error' : undefined}
      />

      {showDropdown && (
        <ul id={listboxId} role="listbox" className={styles.suggestions}>
          {isSearching ? (
            <li className={styles.loading}>検索中...</li>
          ) : (
            searchResults.map((result, index) => (
              <li
                key={`${result.isbn ?? result.title}-${index}`}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={`${styles.suggestion} ${index === activeIndex ? styles.active : ''}`}
                onClick={() => handleSelect(result)}
              >
                <div className={styles.suggestionTitle}>{result.title}</div>
                <div className={styles.suggestionMeta}>
                  {result.author && (
                    <span className={styles.author}>{result.author}</span>
                  )}
                  {result.totalPages && (
                    <span className={styles.pages}>{result.totalPages}p</span>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
