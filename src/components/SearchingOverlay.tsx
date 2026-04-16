"use client";

import { motion } from "framer-motion";
import styles from "./SearchingOverlay.module.css";

interface SearchingOverlayProps {
  onCancel: () => void;
}

export default function SearchingOverlay({ onCancel }: SearchingOverlayProps) {
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={styles.card}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Spinner */}
        <div className={styles.spinnerWrap}>
          <div className={styles.spinner} />
          <div className={styles.spinnerInner} />
          <div className={styles.spinnerDot} />
        </div>

        <h2 className={styles.title}>Finding Opponent</h2>
        <p className={styles.subtitle}>Searching for a worthy challenger…</p>

        <div className={styles.dots}>
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
          />
          <motion.span
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
          />
        </div>

        <motion.button
          className={styles.cancelBtn}
          onClick={onCancel}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Cancel
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
