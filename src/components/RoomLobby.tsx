"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./RoomLobby.module.css";

type Tab = "create" | "join";

interface RoomLobbyProps {
  onBack: () => void;
  onCreateRoom: () => Promise<void>;
  onJoinRoom: (roomCode: string) => Promise<void>;
  roomCode?: string | null;
  isLoading?: boolean;
  roomError?: string | null;
}

export default function RoomLobby({
  onBack,
  onCreateRoom,
  onJoinRoom,
  roomCode,
  isLoading = false,
  roomError,
}: RoomLobbyProps) {
  const [activeTab, setActiveTab] = useState<Tab>("create");

  // Join room state
  const [inputCode, setInputCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    await onCreateRoom();
  };

  const handleJoin = async () => {
    const code = inputCode.trim().toUpperCase();
    if (code.length !== 6) {
      setCodeError("Room code must be exactly 6 characters.");
      return;
    }
    setCodeError("");
    await onJoinRoom(code);
  };

  const handleCodeChange = (val: string) => {
    setInputCode(val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
    if (codeError) setCodeError("");
  };

  const handleCopy = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Waiting state — creator has created the room, code is ready
  const isWaiting = !!roomCode && !isLoading;

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
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack} aria-label="Back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={styles.headerText}>
            <h2 className={styles.title}>
              {isWaiting ? "Waiting for Friend" : "Private Room"}
            </h2>
            <p className={styles.subtitle}>
              {isWaiting ? "Share the code below" : "Play with a friend"}
            </p>
          </div>
          <div className={styles.headerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Waiting state: code is ready, waiting for opponent ── */}
          {isWaiting ? (
            <motion.div
              key="waiting"
              className={styles.waitingPanel}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {/* Spinner */}
              <div className={styles.waitingSpinnerWrap}>
                <span className={styles.waitingRing} />
                <span className={styles.waitingIcon}>🔗</span>
              </div>

              <p className={styles.waitingLabel}>Share this code with your friend</p>

              {/* Code display */}
              <div className={styles.codeDisplay}>
                {roomCode!.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className={styles.codeChar}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Copy button */}
              <motion.button
                id="copy-room-code-btn"
                className={styles.copyBtn}
                onClick={handleCopy}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {copied ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8"/>
                    </svg>
                    Copy Code
                  </>
                )}
              </motion.button>

              <p className={styles.waitingHint}>
                The game starts automatically when your friend joins.
              </p>

              <motion.button
                id="cancel-room-btn"
                className={styles.cancelBtn}
                onClick={onBack}
                whileHover={{ opacity: 0.8 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          ) : (
            /* ── Normal create / join tabs ── */
            <motion.div
              key="tabs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Tabs */}
              <div className={styles.tabBar}>
                {(["create", "join"] as Tab[]).map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                    onClick={() => setActiveTab(tab)}
                    disabled={isLoading}
                  >
                    {activeTab === tab && (
                      <motion.span
                        className={styles.tabIndicator}
                        layoutId="tabIndicator"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                    <span className={styles.tabLabel}>
                      {tab === "create" ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                          Create Room
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Join Room
                        </>
                      )}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className={styles.content}>
                <AnimatePresence mode="wait">
                  {activeTab === "create" ? (
                    <motion.div
                      key="create"
                      className={styles.panel}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className={styles.createHero}>
                        <div className={styles.createIconWrap}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className={styles.createHeroText}>
                          Create a private room and share the 6-character code with your friend.
                        </p>
                      </div>

                      {/* Error from context */}
                      {roomError && (
                        <motion.p
                          className={styles.errorMsg}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          ⚠ {roomError}
                        </motion.p>
                      )}

                      <motion.button
                        id="create-room-btn"
                        className={styles.primaryBtn}
                        onClick={handleCreate}
                        disabled={isLoading}
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                      >
                        {isLoading ? (
                          <span className={styles.spinner} />
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                            Create Room
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="join"
                      className={styles.panel}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className={styles.joinHero}>
                        <div className={styles.joinIconWrap}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <p className={styles.joinHeroText}>
                          Enter the code shared by your friend to join their room instantly.
                        </p>
                      </div>

                      {/* Room Code Input */}
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="room-code-input">
                          Room Code
                        </label>
                        <div className={`${styles.inputWrapper} ${codeError || roomError ? styles.inputError : ""}`}>
                          <span className={styles.inputIcon}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <input
                            id="room-code-input"
                            className={`${styles.input} ${styles.codeInput}`}
                            type="text"
                            placeholder="e.g. A1B2C3"
                            value={inputCode}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            maxLength={6}
                            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                            disabled={isLoading}
                          />
                        </div>
                        {(codeError || roomError) && (
                          <motion.p
                            className={styles.errorMsg}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            ⚠ {codeError || roomError}
                          </motion.p>
                        )}
                      </div>

                      {/* Code Boxes Display */}
                      <div className={styles.codeBoxes}>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className={`${styles.codeBox} ${inputCode[i] ? styles.codeBoxFilled : ""}`}
                          >
                            {inputCode[i] || ""}
                          </div>
                        ))}
                      </div>

                      <motion.button
                        id="join-room-btn"
                        className={styles.primaryBtn}
                        onClick={handleJoin}
                        disabled={!inputCode.trim() || isLoading}
                        whileHover={{ scale: inputCode.trim() ? 1.02 : 1 }}
                        whileTap={{ scale: inputCode.trim() ? 0.98 : 1 }}
                      >
                        {isLoading ? (
                          <span className={styles.spinner} />
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Join Room
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
