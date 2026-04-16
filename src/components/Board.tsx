"use client";

import { motion } from "framer-motion";
import { getWinningLine } from "@/context/GameContext";
import styles from "./Board.module.css";

interface BoardProps {
  board: (string | null)[];
  currentTurn: "X" | "O";
  playerMark: "X" | "O" | null;
  gameOver: boolean;
  onCellClick: (index: number) => void;
}

export default function Board({ board, currentTurn, playerMark, gameOver, onCellClick }: BoardProps) {
  const winLine = getWinningLine(board);

  return (
    <motion.div
      className={styles.board}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Grid lines */}
      <div className={styles.gridLines}>
        <span className={styles.lineV1} />
        <span className={styles.lineV2} />
        <span className={styles.lineH1} />
        <span className={styles.lineH2} />
      </div>

      {board.map((cell, i) => {
        const isWinCell = winLine?.includes(i);
        const isMyTurn = currentTurn === playerMark;
        const canClick = !cell && !gameOver && isMyTurn;

        return (
          <motion.button
            key={i}
            className={`${styles.cell} ${cell ? styles.filled : ""} ${isWinCell ? styles.winCell : ""} ${canClick ? styles.clickable : ""}`}
            onClick={() => canClick && onCellClick(i)}
            whileHover={canClick ? { scale: 1.05 } : {}}
            whileTap={canClick ? { scale: 0.95 } : {}}
            disabled={!canClick}
            aria-label={`Cell ${i + 1}, ${cell || "empty"}`}
            id={`cell-${i}`}
          >
            {cell && (
              <motion.div
                className={styles.mark}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {cell === "X" ? <XMark glow={isWinCell} /> : <OMark glow={isWinCell} />}
              </motion.div>
            )}

            {/* Hover hint */}
            {canClick && !cell && (
              <div className={`${styles.hint} ${playerMark === "X" ? styles.hintX : styles.hintO}`}>
                {playerMark === "X" ? <XMark glow={false} /> : <OMark glow={false} />}
              </div>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

function XMark({ glow }: { glow?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={`${styles.xSvg} ${glow ? styles.glowX : ""}`}>
      <motion.line
        x1="16" y1="16" x2="48" y2="48"
        stroke="var(--x-color)" strokeWidth="5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.3 }}
      />
      <motion.line
        x1="48" y1="16" x2="16" y2="48"
        stroke="var(--x-color)" strokeWidth="5" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      />
    </svg>
  );
}

function OMark({ glow }: { glow?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={`${styles.oSvg} ${glow ? styles.glowO : ""}`}>
      <motion.circle
        cx="32" cy="32" r="18"
        stroke="var(--o-color)" strokeWidth="5" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.4 }}
      />
    </svg>
  );
}
