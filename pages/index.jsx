// pages/index.jsx
// ─────────────────────────────────────────────────────────────────────────────
// "Sonic Suspect" — a voice memory game powered by Cartesia Sonic-3
//
// GAME LOOP:
//   1. 4×4 grid of 16 face-down cards, each hiding a character
//   2. Click a card → plays a Cartesia voice clip via /api/speak
//   3. Click a name from the side panel to make a guess
//   4. Correct → card flips permanently, character revealed
//   5. Wrong → 10-second penalty added to score
//   6. Win when all 16 matched. Score = elapsed time + penalties
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { CHARACTERS } from "../lib/characters";

const WRONG_PENALTY = 10; // seconds per wrong guess

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─── AUDIO ───────────────────────────────────────────────────────────────────

async function fetchAudio(text, voiceId, emotion, speed) {
  // Calls our Next.js serverless proxy at /api/speak
  // which then calls Cartesia server-to-server (no CORS issues)
  const res = await fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId, emotion, speed }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Audio generation failed");
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ─── CARD COMPONENT ──────────────────────────────────────────────────────────

function Card({ character, isRevealed, isPlaying, isSelected, isMatched, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: "100%",
        aspectRatio: "1",
        cursor: isMatched ? "default" : "pointer",
        perspective: "600px",
        userSelect: "none",
      }}
    >
      {/* Flip container */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d",
        transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
        transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>

        {/* FRONT — face down */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          borderRadius: 12,
          background: isSelected
            ? "linear-gradient(135deg, #3a1a6a, #6437ff)"
            : isPlaying
            ? "linear-gradient(135deg, #0d2a4a, #0070f3)"
            : "linear-gradient(135deg, #13131f, #1e1e30)",
          border: isSelected
            ? "2px solid #a855f7"
            : isPlaying
            ? "2px solid #3b82f6"
            : "1px solid #2a2a3d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 6,
          boxShadow: isPlaying
            ? "0 0 24px rgba(59,130,246,0.45)"
            : isSelected
            ? "0 0 24px rgba(168,85,247,0.35)"
            : "0 2px 8px rgba(0,0,0,0.4)",
          transition: "all 0.2s ease",
        }}>
          {isPlaying ? (
            // Animated sound bars while audio plays
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 30 }}>
              {[14, 22, 18, 26, 16].map((h, i) => (
                <div key={i} style={{
                  width: 4,
                  height: h,
                  background: "#60a5fa",
                  borderRadius: 2,
                  animation: `soundbar 0.5s ${i * 0.08}s ease-in-out infinite alternate`,
                }} />
              ))}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 26, opacity: 0.7 }}>🎭</div>
              <div style={{
                color: "#3a3a5a",
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>
                {isSelected ? "pick a name →" : "click to hear"}
              </div>
            </>
          )}
        </div>

        {/* BACK — revealed */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          borderRadius: 12,
          background: `linear-gradient(135deg, ${character.color}28, ${character.color}50)`,
          border: `1px solid ${character.color}88`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 5,
          boxShadow: `0 0 16px ${character.color}33`,
        }}>
          <div style={{ fontSize: 30 }}>{character.emoji}</div>
          <div style={{
            color: "#d4ccf0",
            fontSize: 9,
            fontWeight: 700,
            textAlign: "center",
            padding: "0 6px",
            lineHeight: 1.4,
            letterSpacing: "0.05em",
          }}>
            {character.name.replace("The ", "")}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── NAME TAG COMPONENT ───────────────────────────────────────────────────────

function NameTag({ character, isMatched, isSelected, onClick }) {
  return (
    <div
      onClick={isMatched ? undefined : onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 8,
        background: isMatched
          ? `${character.color}18`
          : isSelected
          ? "linear-gradient(135deg, #3a1a6a, #5a2aaa)"
          : "#13131f",
        border: isMatched
          ? `1px solid ${character.color}44`
          : isSelected
          ? "1px solid #a855f7"
          : "1px solid #22223a",
        color: isMatched ? "#3a3a5a" : isSelected ? "#f0e8ff" : "#b0a8d0",
        fontSize: 12,
        fontWeight: isSelected ? 700 : 400,
        cursor: isMatched ? "default" : "pointer",
        textDecoration: isMatched ? "line-through" : "none",
        opacity: isMatched ? 0.45 : 1,
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: isSelected ? "0 0 14px rgba(168,85,247,0.25)" : "none",
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{character.emoji}</span>
      <span style={{ flex: 1 }}>{character.name}</span>
      {isMatched && (
        <span style={{ color: "#4ade80", fontSize: 13 }}>✓</span>
      )}
    </div>
  );
}

// ─── WIN SCREEN ───────────────────────────────────────────────────────────────

function WinScreen({ elapsed, wrongGuesses, score, onPlayAgain }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.88)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 200,
      animation: "fadeIn 0.4s ease",
    }}>
      <div style={{
        background: "#12121e",
        border: "1px solid #2a2a40",
        borderRadius: 20,
        padding: "52px 44px",
        textAlign: "center",
        maxWidth: 440,
        width: "90%",
        boxShadow: "0 0 80px rgba(168,85,247,0.2), 0 0 160px rgba(100,55,255,0.1)",
      }}>
        <div style={{ fontSize: 68, marginBottom: 12 }}>🎉</div>
        <h2 style={{
          color: "#f0e8ff",
          fontSize: 30,
          fontWeight: 700,
          margin: "0 0 8px",
          letterSpacing: "-0.5px",
        }}>
          You got them all!
        </h2>
        <p style={{ color: "#5a5a7a", margin: "0 0 36px", fontSize: 14 }}>
          Your ears are sharper than most.
        </p>

        {/* Score breakdown */}
        <div style={{
          display: "flex",
          gap: 0,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 36,
          background: "#0a0a14",
          borderRadius: 12,
          padding: "20px 24px",
          border: "1px solid #1a1a2a",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#60a5fa", fontSize: 32, fontWeight: 700, fontFamily: "monospace" }}>
              {formatTime(elapsed)}
            </div>
            <div style={{ color: "#3a3a5a", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
              time
            </div>
          </div>
          <div style={{ color: "#2a2a40", fontSize: 24, padding: "0 8px" }}>+</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#f87171", fontSize: 32, fontWeight: 700, fontFamily: "monospace" }}>
              {wrongGuesses * WRONG_PENALTY}s
            </div>
            <div style={{ color: "#3a3a5a", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
              {wrongGuesses} wrong ×{WRONG_PENALTY}s
            </div>
          </div>
          <div style={{ color: "#2a2a40", fontSize: 24, padding: "0 8px" }}>=</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#a855f7", fontSize: 32, fontWeight: 700, fontFamily: "monospace" }}>
              {formatTime(score)}
            </div>
            <div style={{ color: "#3a3a5a", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>
              final score
            </div>
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          style={{
            padding: "15px 40px",
            background: "linear-gradient(135deg, #6437ff, #a855f7)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.05em",
            boxShadow: "0 4px 24px rgba(100,55,255,0.4)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 8px 32px rgba(100,55,255,0.5)";
          }}
          onMouseLeave={e => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 24px rgba(100,55,255,0.4)";
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

// ─── MAIN GAME ────────────────────────────────────────────────────────────────

export default function Home() {
  // Start with fixed order (matches server render), shuffle after mount.
  // This prevents Next.js hydration mismatch errors.
  const [cards, setCards] = useState(CHARACTERS);
  useEffect(() => { setCards(shuffle(CHARACTERS)); }, []);
  const nameList = [...CHARACTERS].sort((a, b) => a.name.localeCompare(b.name));

  const [revealed, setRevealed] = useState({});       // charId → true when matched
  const [playing, setPlaying] = useState(null);        // charId currently speaking
  const [selectedCard, setSelectedCard] = useState(null);  // charId of clicked card
  const [selectedName, setSelectedName] = useState(null);  // charId from name panel
  const [matched, setMatched] = useState({});          // charId → true
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState(null);      // { type, msg }
  const [phraseIndex, setPhraseIndex] = useState({});  // charId → next phrase index
  const [apiError, setApiError] = useState(null);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const feedbackRef = useRef(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  // ── Check win ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (started && Object.keys(matched).length === CHARACTERS.length) {
      setFinished(true);
      clearInterval(timerRef.current);
    }
  }, [matched, started]);

  // ── Play audio for a card ──────────────────────────────────────────────────
  const playCard = useCallback(async (charId) => {
    if (playing) return; // don't interrupt ongoing audio

    const character = CHARACTERS.find(c => c.id === charId);
    if (!character) return;

    // Pick next phrase cyclically so replays feel fresh
    const idx = phraseIndex[charId] ?? 0;
    const phrase = character.phrases[idx % character.phrases.length];
    setPhraseIndex(p => ({ ...p, [charId]: idx + 1 }));

    setPlaying(charId);
    setApiError(null);

    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }

      const audioUrl = await fetchAudio(
        phrase,
        character.voiceId,
        character.emotion,
        character.speed
      );

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.play();
      audio.onended = () => {
        setPlaying(null);
        URL.revokeObjectURL(audioUrl);
      };
      audio.onerror = () => {
        setPlaying(null);
      };
    } catch (err) {
      console.error("Audio error:", err);
      setApiError(err.message);
      setPlaying(null);
    }
  }, [playing, phraseIndex]);

  // ── Handle card click ──────────────────────────────────────────────────────
  const handleCardClick = useCallback((charId) => {
    if (playing) return;
    if (matched[charId]) return;

    // Toggle selection
    setSelectedCard(prev => {
      const next = prev === charId ? null : charId;
      return next;
    });

    // Always play audio when clicking a card
    if (!started) setStarted(true);
    playCard(charId);
  }, [matched, started, playCard]);

  // ── Handle name click ──────────────────────────────────────────────────────
  const handleNameClick = useCallback((charId) => {
    if (matched[charId]) return;
    setSelectedName(prev => prev === charId ? null : charId);
  }, [matched]);

  // ── Check match when both card and name are selected ───────────────────────
  useEffect(() => {
    if (selectedCard === null || selectedName === null) return;

    const isCorrect = selectedCard === selectedName;
    const character = CHARACTERS.find(c => c.id === selectedCard);

    // Clear feedback timer
    if (feedbackRef.current) clearTimeout(feedbackRef.current);

    if (isCorrect) {
      setMatched(m => ({ ...m, [selectedCard]: true }));
      setRevealed(r => ({ ...r, [selectedCard]: true }));
      setFeedback({ type: "correct", msg: `✓ ${character.name}!` });
    } else {
      setWrongGuesses(w => w + 1);
      setFeedback({ type: "wrong", msg: `✗ Not quite — try again!` });
    }

    setSelectedCard(null);
    setSelectedName(null);
    feedbackRef.current = setTimeout(() => setFeedback(null), 1600);
  }, [selectedCard, selectedName]);

  // ── Reset game ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    clearInterval(timerRef.current);
    if (feedbackRef.current) clearTimeout(feedbackRef.current);

    setCards(shuffle(CHARACTERS));  // reshuffle on reset
    setRevealed({});
    setPlaying(null);
    setSelectedCard(null);
    setSelectedName(null);
    setMatched({});
    setWrongGuesses(0);
    setElapsed(0);
    setStarted(false);
    setFinished(false);
    setFeedback(null);
    setPhraseIndex({});
    setApiError(null);
  };

  const score = elapsed + wrongGuesses * WRONG_PENALTY;
  const matchedCount = Object.keys(matched).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Sonic Suspect — A Cartesia Voice Game</title>
        <meta name="description" content="A voice memory game powered by Cartesia Sonic-3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        padding: "20px 16px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* ── HEADER ──────────────────────────────────────────────────────── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 16,
          }}>
            <div>
              <h1 style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#f0e8ff",
                letterSpacing: "-0.5px",
                margin: 0,
              }}>
                🎭 Sonic Suspect
              </h1>
              <div style={{ color: "#3a3a5a", fontSize: 11, marginTop: 3 }}>
                powered by{" "}
                <a
                  href="https://cartesia.ai"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#6437ff", textDecoration: "none" }}
                >
                  Cartesia Sonic‑3
                </a>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {[
                { label: "Time",  value: formatTime(elapsed), color: "#60a5fa" },
                { label: "Wrong", value: `${wrongGuesses}`, sub: `×${WRONG_PENALTY}s`, color: "#f87171" },
                { label: "Score", value: formatTime(score), color: "#a855f7" },
                { label: "Found", value: `${matchedCount}`, sub: "/16", color: "#4ade80" },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{
                    color: "#3a3a5a",
                    fontSize: 9,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}>
                    {label}
                  </div>
                  <div style={{
                    color,
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    lineHeight: 1,
                  }}>
                    {value}
                    {sub && (
                      <span style={{ fontSize: 11, color: "#3a3a5a", fontWeight: 400 }}>
                        {sub}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={handleReset}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: "1px solid #2a2a3a",
                  borderRadius: 8,
                  color: "#5a5a7a",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.target.style.borderColor = "#4a4a6a";
                  e.target.style.color = "#9a9abd";
                }}
                onMouseLeave={e => {
                  e.target.style.borderColor = "#2a2a3a";
                  e.target.style.color = "#5a5a7a";
                }}
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* ── INSTRUCTIONS ────────────────────────────────────────────────── */}
          {!started && (
            <div style={{
              background: "#12121e",
              border: "1px solid #1e1e30",
              borderRadius: 10,
              padding: "12px 18px",
              marginBottom: 18,
              fontSize: 13,
              color: "#7a7a9a",
              lineHeight: 1.7,
              animation: "fadeIn 0.4s ease",
            }}>
              <strong style={{ color: "#c0b8e0" }}>How to play:</strong>{" "}
              Click any card to hear a mystery voice. Then click the matching name from the panel on the right.
              Each wrong guess adds{" "}
              <strong style={{ color: "#f87171" }}>{WRONG_PENALTY} seconds</strong> to your score.
              Lowest time wins. 🎧
            </div>
          )}

          {/* ── API ERROR ────────────────────────────────────────────────────── */}
          {apiError && (
            <div style={{
              background: "#2a1010",
              border: "1px solid #f87171",
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 14,
              fontSize: 12,
              color: "#f87171",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span>⚠ {apiError}</span>
              <button
                onClick={() => setApiError(null)}
                style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16 }}
              >
                ×
              </button>
            </div>
          )}

          {/* ── FEEDBACK TOAST ───────────────────────────────────────────────── */}
          {feedback && (
            <div style={{
              position: "fixed",
              top: 24,
              left: "50%",
              transform: "translateX(-50%)",
              background: feedback.type === "correct" ? "#0f2a0f" : "#2a0f0f",
              border: `1px solid ${feedback.type === "correct" ? "#4ade80" : "#f87171"}`,
              color: feedback.type === "correct" ? "#4ade80" : "#f87171",
              padding: "11px 28px",
              borderRadius: 30,
              fontSize: 14,
              fontWeight: 700,
              zIndex: 100,
              animation: "pop 0.3s ease forwards",
              boxShadow: `0 4px 24px ${feedback.type === "correct" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
              whiteSpace: "nowrap",
            }}>
              {feedback.msg}
            </div>
          )}

          {/* ── MAIN LAYOUT: GRID + NAME PANEL ──────────────────────────────── */}
          <div style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
          }}>
            {/* 4×4 CARD GRID */}
            <div style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
            }}>
              {cards.map(character => (
                <Card
                  key={character.id}
                  character={character}
                  isRevealed={!!revealed[character.id]}
                  isPlaying={playing === character.id}
                  isSelected={selectedCard === character.id}
                  isMatched={!!matched[character.id]}
                  onClick={() => handleCardClick(character.id)}
                />
              ))}
            </div>

            {/* NAME PANEL */}
            <div style={{
              width: 220,
              flexShrink: 0,
              background: "#0e0e1a",
              border: "1px solid #1a1a2a",
              borderRadius: 12,
              padding: 12,
              position: "sticky",
              top: 20,
            }}>
              <div style={{
                color: "#3a3a5a",
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 10,
                lineHeight: 1.5,
              }}>
                {selectedCard
                  ? "← now pick a name"
                  : "click a card first →"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {nameList.map(character => (
                  <NameTag
                    key={character.id}
                    character={character}
                    isMatched={!!matched[character.id]}
                    isSelected={selectedName === character.id}
                    onClick={() => handleNameClick(character.id)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── FOOTER ──────────────────────────────────────────────────────── */}
          <div style={{
            marginTop: 28,
            textAlign: "center",
            color: "#2a2a3a",
            fontSize: 11,
          }}>
            Built with{" "}
            <a href="https://cartesia.ai" target="_blank" rel="noreferrer"
              style={{ color: "#3a3a5a", textDecoration: "none" }}>
              Cartesia Sonic‑3
            </a>
            {" · "}
            <a href="https://nextjs.org" target="_blank" rel="noreferrer"
              style={{ color: "#3a3a5a", textDecoration: "none" }}>
              Next.js
            </a>
            {" · "}
            <a href="https://vercel.com" target="_blank" rel="noreferrer"
              style={{ color: "#3a3a5a", textDecoration: "none" }}>
              Vercel
            </a>
          </div>

        </div>
      </div>

      {/* ── WIN SCREEN ──────────────────────────────────────────────────────── */}
      {finished && (
        <WinScreen
          elapsed={elapsed}
          wrongGuesses={wrongGuesses}
          score={score}
          onPlayAgain={handleReset}
        />
      )}
    </>
  );
}
