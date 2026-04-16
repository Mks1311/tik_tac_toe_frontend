"use client";

import { motion } from "framer-motion";
import styles from "./GameHeader.module.css";

interface GameHeaderProps {
  playerMark: "X" | "O";
  opponentName: string;
  currentTurn: "X" | "O";
  onLeave: () => void;
}

export default function GameHeader({ playerMark, opponentName, currentTurn, onLeave }: GameHeaderProps) {
  const isMyTurn = currentTurn === playerMark;

  return (
    <motion.div
      className={styles.header}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.players}>
        {/* You */}
        <div className={`${styles.player} ${isMyTurn ? styles.active : ""}`}>
          <span className={`${styles.badge} ${playerMark === "X" ? styles.badgeX : styles.badgeO}`}>
            {playerMark}
          </span>
          <div className={styles.info}>
            <span className={styles.name}>You</span>
            <span className={styles.role}>{playerMark === "X" ? "Crosses" : "Noughts"}</span>
          </div>
          {isMyTurn && <span className={styles.turnIndicator}>Your turn</span>}
        </div>

        {/* VS */}
        <div className={styles.vs}>
          <span>VS</span>
        </div>

        {/* Opponent */}
        <div className={`${styles.player} ${!isMyTurn ? styles.active : ""}`}>
          <span className={`${styles.badge} ${playerMark === "X" ? styles.badgeO : styles.badgeX}`}>
            {playerMark === "X" ? "O" : "X"}
          </span>
          <div className={styles.info}>
            <span className={styles.name}>{opponentName}</span>
            <span className={styles.role}>{playerMark === "X" ? "Noughts" : "Crosses"}</span>
          </div>
          {!isMyTurn && <span className={styles.turnIndicator}>Their turn</span>}
        </div>
      </div>

      <motion.button
        className={styles.leaveBtn}
        onClick={onLeave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Leave
      </motion.button>
    </motion.div>
  );
}
