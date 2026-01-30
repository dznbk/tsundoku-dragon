import { useState, useEffect, useCallback } from 'react';
import { DQWindow } from '../../../components/DQWindow';
import styles from './BattleMessage.module.css';

interface BattleMessageProps {
  messages: string[];
  onComplete: () => void;
  typingSpeed?: number;
  messageInterval?: number;
}

export function BattleMessage({
  messages,
  onComplete,
  typingSpeed = 50,
  messageInterval = 1000,
}: BattleMessageProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentMessage = messages[currentMessageIndex] || '';

  const moveToNextMessage = useCallback(() => {
    if (currentMessageIndex < messages.length - 1) {
      setCurrentMessageIndex((prev) => prev + 1);
      setDisplayedText('');
      setIsTyping(true);
    } else {
      onComplete();
    }
  }, [currentMessageIndex, messages.length, onComplete]);

  // タイピングエフェクト
  useEffect(() => {
    if (!isTyping || !currentMessage) return;

    if (displayedText.length < currentMessage.length) {
      const timer = setTimeout(() => {
        setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
      }, typingSpeed);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [displayedText, currentMessage, typingSpeed, isTyping]);

  // メッセージ完了後の待機
  useEffect(() => {
    if (isTyping || displayedText !== currentMessage) return;

    const timer = setTimeout(() => {
      moveToNextMessage();
    }, messageInterval);
    return () => clearTimeout(timer);
  }, [
    isTyping,
    displayedText,
    currentMessage,
    messageInterval,
    moveToNextMessage,
  ]);

  return (
    <DQWindow className={styles.messageWindow}>
      <p className={styles.text} aria-live="polite">
        {displayedText}
        {isTyping && <span className={styles.cursor}>|</span>}
      </p>
    </DQWindow>
  );
}
