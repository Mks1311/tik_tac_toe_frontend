"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import Logo from "@/components/Logo";
import PlayButton from "@/components/PlayButton";
import SearchingOverlay from "@/components/SearchingOverlay";
import GameHeader from "@/components/GameHeader";
import Board from "@/components/Board";
import ResultModal from "@/components/ResultModal";
import styles from "./page.module.css";
import { useEffect } from "react";

export default function Home() {
  const { state, play, cancelSearch, makeMove, reset } = useGame();

  useEffect(()=>{
    console.log('state',state)
  },[state])

  return (
    <main className={styles.main}>
      {/* Background decorative elements */}
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />
      <div className={styles.bgOrb3} />

      {/* ── Home Screen ─── */}
      <AnimatePresence mode="wait">
        {state.screen === "home" && (
          <motion.div
            key="home"
            className={styles.homeScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <Logo />

            <motion.div
              className={styles.heroText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <h1 className={styles.heading}>
                The Classic Game,{" "}
                <span className={styles.headingGradient}>Reimagined</span>
              </h1>
              <p className={styles.tagline}>
                Challenge players worldwide in real-time multiplayer Tic-Tac-Toe.
              </p>
            </motion.div>

            <PlayButton onClick={play} />

            <motion.div
              className={styles.features}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className={styles.feature}>
                <span className={styles.featureIcon}>⚡</span>
                <span>Instant Matchmaking</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🛡️</span>
                <span>Server Authoritative</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🌐</span>
                <span>Real-time Multiplayer</span>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Game Screen ─── */}
        {(state.screen === "game" || state.screen === "result") && (
          <motion.div
            key="game"
            className={styles.gameScreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <GameHeader
              playerMark={state.playerMark!}
              opponentName={"Opponent"}
              currentTurn={state.currentTurn}
              onLeave={reset}
            />

            <Board
              board={state.board}
              currentTurn={state.currentTurn}
              playerMark={state.playerMark}
              gameOver={state.gameOver}
              onCellClick={makeMove}
            />

            <motion.div
              className={styles.turnBar}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {!state.gameOver && (
                <p className={styles.turnText}>
                  {state.currentTurn === state.playerMark ? (
                    <>Tap a cell to place your <strong>{state.playerMark}</strong></>
                  ) : (
                    <>Waiting for opponent&apos;s move…</>
                  )}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Searching Overlay ─── */}
      <AnimatePresence>
        {state.screen === "searching" && (
          <SearchingOverlay onCancel={cancelSearch} />
        )}
      </AnimatePresence>

      {/* ── Result Modal ─── */}
      <AnimatePresence>
        {state.screen === "result" && (
          <ResultModal
            winner={state.winner}
            playerMark={state.playerMark}
            onPlayAgain={play}
            onHome={reset}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
