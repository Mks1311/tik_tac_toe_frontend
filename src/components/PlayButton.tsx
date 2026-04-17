"use client";

import { motion } from "framer-motion";
import styles from "./PlayButton.module.css";

interface PlayButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export default function PlayButton({ onClick, disabled, isLoading }: PlayButtonProps) {
  return (
    <motion.button
      className={`${styles.wrapper} ${isLoading ? styles.wrapperLoading : ""}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.97 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    >
      {/* Animated ring */}
      <span className={styles.ring} />
      <span className={styles.ring2} />

      <span className={styles.inner}>
        {isLoading ? (
          <span className={styles.btnSpinner} />
        ) : (
          <svg
            className={styles.playIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 5.14v13.72a1 1 0 001.5.86l11.04-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z"
              fill="currentColor"
            />
          </svg>
        )}
        <span className={styles.label}>{isLoading ? "" : "PLAY"}</span>
      </span>
    </motion.button>
  );
}
