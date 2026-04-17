"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/context/GameContext";
import Logo from "@/components/Logo";
import PlayButton from "@/components/PlayButton";
import SearchingOverlay from "@/components/SearchingOverlay";
import GameHeader from "@/components/GameHeader";
import Board from "@/components/Board";
import ResultModal from "@/components/ResultModal";
import RoomLobby from "@/components/RoomLobby";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { healthcheck } from "@/lib/nakama";

export default function Home() {
  const { state, play, cancelSearch, makeMove, reset, goToRoom, createRoom, joinRoom, isRoomLoading, isPlayLoading } = useGame();

  // Fire-and-forget: wake up the Render backend as soon as the page loads.
  // By the time the user clicks a button, the server has had time to spin up.
  useEffect(() => {
    healthcheck();
  }, []);

  // Show a slow-load warning if the backend is still pending after 5 s
  const [showSlowLoad, setShowSlowLoad] = useState(false);
  useEffect(() => {
    if (!isPlayLoading) {
      setShowSlowLoad(false);
      return;
    }
    const t = setTimeout(() => setShowSlowLoad(true), 5000);
    return () => clearTimeout(t);
  }, [isPlayLoading]);

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

            <motion.div
              className={styles.modeButtons}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <PlayButton onClick={play} isLoading={isPlayLoading} />

              <motion.button
                id="private-room-btn"
                className={styles.roomBtn}
                onClick={goToRoom}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className={styles.roomBtnIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span>
                  <span className={styles.roomBtnLabel}>Play with Friend</span>
                  <span className={styles.roomBtnSub}>Create or join a private room</span>
                </span>
                <svg className={styles.roomBtnArrow} width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </motion.div>

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

      {/* ── Room Lobby (create / join) ─── */}
      <AnimatePresence>
        {state.screen === "room" && (
          <RoomLobby
            onBack={reset}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            roomCode={state.roomCode}
            isLoading={isRoomLoading}
            roomError={state.error}
          />
        )}
      </AnimatePresence>
      {/* ── Play Loader Overlay ─── */}
      <AnimatePresence>
        {isPlayLoading && (
          <motion.div
            key="play-loader"
            className={styles.loaderOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={styles.loaderCard}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.loaderSpinnerWrap}>
                <div className={styles.loaderRing} />
                <div className={styles.loaderRing2} />
              </div>
              <p className={styles.loaderTitle}>Connecting to server…</p>
              <AnimatePresence>
                {showSlowLoad && (
                  <motion.div
                    className={styles.slowLoadMsg}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className={styles.slowLoadIcon}>⏳</span>
                    <p>
                      The backend is hosted on Render and may have spun down.
                      Hang tight while it starts back up — or do a{" "}
                      <button
                        className={styles.reloadBtn}
                        onClick={() => window.location.reload()}
                      >
                        hard reload
                      </button>
                      {" "}and try again.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
