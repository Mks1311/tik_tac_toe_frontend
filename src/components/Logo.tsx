"use client";

import { motion } from "framer-motion";
import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <motion.div
      className={styles.logo}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.icon}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* X mark */}
          <motion.line
            x1="8" y1="8" x2="22" y2="22"
            stroke="var(--x-color)" strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.line
            x1="22" y1="8" x2="8" y2="22"
            stroke="var(--x-color)" strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          />
          {/* O mark */}
          <motion.circle
            cx="35" cy="33" r="9"
            stroke="var(--o-color)" strokeWidth="3" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </svg>
      </div>
      <div className={styles.text}>
        <span className={styles.title}>LILA</span>
        <span className={styles.subtitle}>Tic-Tac-Toe</span>
      </div>
    </motion.div>
  );
}
