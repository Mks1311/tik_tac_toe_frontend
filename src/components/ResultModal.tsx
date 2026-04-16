"use client";

import { motion } from "framer-motion";
import styles from "./ResultModal.module.css";

interface ResultModalProps {
  winner: string | null; // "X" | "O" | "draw"
  playerMark: "X" | "O" | null;
  onPlayAgain: () => void;
  onHome: () => void;
}

export default function ResultModal({ winner, playerMark, onPlayAgain, onHome }: ResultModalProps) {
  const isDraw = winner === "draw";
  const isWin = winner === playerMark;

  let title: string;
  let subtitle: string;
  let emoji: string;

  if (isDraw) {
    title = "It's a Draw!";
    subtitle = "Great minds think alike.";
    emoji = "🤝";
  } else if (isWin) {
    title = "Victory!";
    subtitle = "You dominated the board.";
    emoji = "🏆";
  } else {
    title = "Defeat";
    subtitle = "Better luck next time.";
    emoji = "😔";
  }

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`${styles.card} ${isDraw ? styles.draw : isWin ? styles.win : styles.lose}`}
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 40 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className={styles.emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
        >
          {emoji}
        </motion.div>

        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>

        {!isDraw && (
          <div className={styles.markDisplay}>
            <span className={isWin ? styles.winnerMark : styles.loserMark}>
              {winner}
            </span>
            <span className={styles.markLabel}>wins</span>
          </div>
        )}

        <div className={styles.actions}>
          <motion.button
            className={styles.playAgainBtn}
            onClick={onPlayAgain}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
            Play Again
          </motion.button>
          <motion.button
            className={styles.homeBtn}
            onClick={onHome}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Home
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
