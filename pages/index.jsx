import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { CHARACTERS } from "../lib/characters";

const WRONG_PENALTY = 10;
const CARD_COLORS = ["card-color-0","card-color-1","card-color-2","card-color-3","card-color-4","card-color-5"];
const GRID_OPTIONS = [
  { label: "2×2", size: 4, cols: 2 },
  { label: "3×3", size: 9, cols: 3 },
  { label: "4×4", size: 16, cols: 4 },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s) {
  return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
}

async function fetchAudio(text, voiceId, emotion, speed) {
  const res = await fetch("/api/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voiceId, emotion, speed }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Audio generation failed");
  }
  return URL.createObjectURL(await res.blob());
}

function Card({ character, cardIndex, isRevealed, isPlaying, isSelected, isMatched, onClick }) {
  const colorClass = CARD_COLORS[cardIndex % 6];

  if (isRevealed) {
    return (
      <div style={{ aspectRatio: "1", width: "100%" }}>
        <div className="card-revealed">
          <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(character.name)}`}
            style={{ width: 52, height: 52, borderRadius: "50%", border: "3px solid #06D6A0" }}
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
            alt={character.name}
          />
          <div style={{ display: "none", fontSize: 36 }}>{character.emoji}</div>
          <div className="card-label" style={{ color: "#1A1A40", padding: "0 4px", textAlign: "center", lineHeight: 1.3 }}>
            {character.name.replace("The ", "")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ aspectRatio: "1", width: "100%" }} onClick={onClick}>
      <div className={`card-face-down ${colorClass} ${isSelected ? "selected" : ""}`}>
        {isPlaying ? (
          <div className="sound-bars">
            {[10, 20, 14, 24, 16].map((h, i) => (
              <div key={i} className="sound-bar" style={{ height: h, animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 28, opacity: 0.5 }}>🎭</div>
        )}
        <div className="card-label">
          {isPlaying ? "🔊 speaking..." : isSelected ? "pick a name →" : "tap to hear"}
        </div>
      </div>
    </div>
  );
}

function NameItem({ character, isMatched, isSelected, onClick }) {
  return (
    <div
      className={`name-item ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""}`}
      onClick={isMatched ? undefined : onClick}
    >
      <span style={{ fontSize: 16 }}>{character.emoji}</span>
      <span style={{ flex: 1 }}>{character.name}</span>
      {isMatched && <span style={{ color: "#06D6A0" }}>✓</span>}
    </div>
  );
}

export default function Home() {
  const [gridSize, setGridSize] = useState(16);
  const [cards, setCards] = useState(CHARACTERS);
  useEffect(() => { setCards(shuffle(CHARACTERS).slice(0, gridSize)); }, []);
  const activeIds = new Set(cards.map(c => c.id));
  const nameList = [...CHARACTERS].filter(c => activeIds.has(c.id)).sort((a, b) => a.name.localeCompare(b.name));
  const gridCols = GRID_OPTIONS.find(o => o.size === gridSize)?.cols ?? 4;

  const [revealed, setRevealed]         = useState({});
  const [playing, setPlaying]           = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [matched, setMatched]           = useState({});
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [elapsed, setElapsed]           = useState(0);
  const [started, setStarted]           = useState(false);
  const [finished, setFinished]         = useState(false);
  const [feedback, setFeedback]         = useState(null);
  const [phraseIndex, setPhraseIndex]   = useState({});
  const [apiError, setApiError]         = useState(null);

  const audioRef   = useRef(null);
  const timerRef   = useRef(null);
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (started && Object.keys(matched).length === gridSize) {
      setFinished(true);
      clearInterval(timerRef.current);
    }
  }, [matched, started, gridSize]);

  const playCard = useCallback(async (charId) => {
    if (playing) return;
    const character = CHARACTERS.find(c => c.id === charId);
    if (!character) return;
    const idx = phraseIndex[charId] ?? 0;
    const phrase = character.phrases[idx % character.phrases.length];
    setPhraseIndex(p => ({ ...p, [charId]: idx + 1 }));
    setPlaying(charId);
    setApiError(null);
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current = null;
      }
      const url = await fetchAudio(phrase, character.voiceId, character.emotion, character.speed);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => { setPlaying(null); URL.revokeObjectURL(url); };
      audio.onerror = () => setPlaying(null);
    } catch (err) {
      setApiError(err.message);
      setPlaying(null);
    }
  }, [playing, phraseIndex]);

  const handleCardClick = useCallback((charId) => {
    if (playing) return;
    if (matched[charId]) return;
    if (!started) setStarted(true);
    setSelectedCard(prev => prev === charId ? null : charId);
    playCard(charId);
  }, [playing, matched, started, playCard]);

  const handleNameClick = useCallback((charId) => {
    if (matched[charId]) return;
    setSelectedName(prev => prev === charId ? null : charId);
  }, [matched]);

  useEffect(() => {
    if (selectedCard === null || selectedName === null) return;
    const isCorrect = selectedCard === selectedName;
    const character = CHARACTERS.find(c => c.id === selectedCard);
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    if (isCorrect) {
      setMatched(m => ({ ...m, [selectedCard]: true }));
      setRevealed(r => ({ ...r, [selectedCard]: true }));
      setFeedback({ type: "correct", msg: `✓ ${character.name}!` });
    } else {
      setWrongGuesses(w => w + 1);
      setFeedback({ type: "wrong", msg: "✗ Not quite — try again!" });
    }
    setSelectedCard(null);
    setSelectedName(null);
    feedbackRef.current = setTimeout(() => setFeedback(null), 1600);
  }, [selectedCard, selectedName]);

  const handleReset = (newSize) => {
    const size = newSize ?? gridSize;
    if (newSize) setGridSize(newSize);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    clearInterval(timerRef.current);
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    setCards(shuffle(CHARACTERS).slice(0, size));
    setRevealed({}); setPlaying(null); setSelectedCard(null); setSelectedName(null);
    setMatched({}); setWrongGuesses(0); setElapsed(0); setStarted(false);
    setFinished(false); setFeedback(null); setPhraseIndex({}); setApiError(null);
  };

  const score = elapsed + wrongGuesses * WRONG_PENALTY;
  const matchedCount = Object.keys(matched).length;

  return (
    <>
      <Head>
        <title>Sonic Suspect — A Cartesia Voice Game</title>
        <meta name="description" content="A voice memory game powered by Cartesia Sonic-3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* HEADER */}
      <div className="header">
        <div>
          <div className="logo-text">🎭 Sonic Suspect</div>
          <div className="logo-sub">powered by <a href="https://cartesia.ai" target="_blank" rel="noreferrer" style={{ color: "#FF9F1C", textDecoration: "none" }}>Cartesia Sonic‑3</a></div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[
            { label: "TIME",  value: formatTime(elapsed), color: "#60CFFF" },
            { label: "WRONG", value: wrongGuesses, sub: `×${WRONG_PENALTY}s`, color: "#FF6B6B" },
            { label: "SCORE", value: formatTime(score), color: "#FFBF00" },
            { label: "FOUND", value: `${matchedCount}`, sub: `/${gridSize}`, color: "#06D6A0" },
          ].map(({ label, value, sub, color }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 50, padding: "5px 14px", textAlign: "center", minWidth: 72 }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }}>{label}</div>
              <div className="stat-value" style={{ color }}>
                {value}{sub && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{sub}</span>}
              </div>
            </div>
          ))}
          <button className="reset-btn" onClick={() => handleReset()}>↺ Reset</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 20px 0", display: "flex", gap: 6 }}>
        {GRID_OPTIONS.map(({ label, size }) => (
          <button
            key={size}
            onClick={() => handleReset(size)}
            style={{
              background: gridSize === size ? "#FFBF00" : "rgba(255,255,255,0.08)",
              color: gridSize === size ? "#1A1A40" : "rgba(255,255,255,0.5)",
              border: gridSize === size ? "2px solid #FFBF00" : "1px solid rgba(255,255,255,0.12)",
              borderRadius: 50, padding: "5px 16px", fontSize: 13, fontWeight: 800,
              cursor: "pointer", letterSpacing: "0.04em",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 40px" }}>

        {/* API ERROR */}
        {apiError && (
          <div style={{ background: "#FFE8E8", border: "2px solid #FF4D4D", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#CC0000", display: "flex", justifyContent: "space-between" }}>
            <span>⚠ {apiError}</span>
            <button onClick={() => setApiError(null)} style={{ background: "none", border: "none", color: "#CC0000", cursor: "pointer", fontSize: 16 }}>×</button>
          </div>
        )}

        {/* INSTRUCTIONS */}
        {!started && (
          <div style={{ background: "#FFBF00", borderRadius: 10, padding: "10px 18px", marginBottom: 16, fontSize: 13, fontWeight: 700, color: "#1A1A40", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ background: "#1A1A40", color: "#FFBF00", borderRadius: 4, padding: "2px 8px", fontSize: 11, letterSpacing: "0.08em" }}>HOW TO PLAY</span>
            Click any card to hear a mystery voice · Pick the matching name · Wrong guess = +10s penalty
          </div>
        )}

        {/* TOAST */}
        {feedback && (
          <div className={`toast ${feedback.type}`}>{feedback.msg}</div>
        )}

        {/* GRID + PANEL */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 12 }}>
            {cards.map((character, i) => (
              <Card
                key={character.id}
                character={character}
                cardIndex={i}
                isRevealed={!!revealed[character.id]}
                isPlaying={playing === character.id}
                isSelected={selectedCard === character.id}
                isMatched={!!matched[character.id]}
                onClick={() => handleCardClick(character.id)}
              />
            ))}
          </div>

          <div style={{ width: 230, flexShrink: 0, position: "sticky", top: 20 }}>
            <div className="name-panel">
              <div className="name-panel-header">
                {selectedCard ? "← now pick a name" : "WHO DO YOU HEAR?"}
              </div>
              {nameList.map(character => (
                <NameItem
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
      </div>

      {/* WIN SCREEN */}
      {finished && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(26,26,64,0.75)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "white", borderRadius: 28, padding: "48px 44px", textAlign: "center", maxWidth: 420, width: "90%", border: "4px solid #1A1A40", boxShadow: "0 12px 0 rgba(0,0,0,0.2), 0 0 0 8px #FFBF00" }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>🏆</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 36, color: "#1A1A40", marginBottom: 6 }}>You got them all!</div>
            <div style={{ color: "#888", fontSize: 14, marginBottom: 28, fontWeight: 700 }}>Your ears are sharper than most.</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "#FFF5FB", borderRadius: 16, padding: "20px", marginBottom: 28, border: "2px solid #eee" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: "#2EC4B6" }}>{formatTime(elapsed)}</div>
                <div style={{ fontSize: 10, color: "#aaa", fontWeight: 800, textTransform: "uppercase" }}>time</div>
              </div>
              <div style={{ fontSize: 22, color: "#ddd", fontWeight: 700 }}>+</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: "#FF4D9E" }}>{wrongGuesses * WRONG_PENALTY}s</div>
                <div style={{ fontSize: 10, color: "#aaa", fontWeight: 800, textTransform: "uppercase" }}>{wrongGuesses} wrong ×{WRONG_PENALTY}s</div>
              </div>
              <div style={{ fontSize: 22, color: "#ddd", fontWeight: 700 }}>=</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: "#FF9F1C" }}>{formatTime(score)}</div>
                <div style={{ fontSize: 10, color: "#aaa", fontWeight: 800, textTransform: "uppercase" }}>final score</div>
              </div>
            </div>
            <button
              onClick={handleReset}
              style={{ background: "#1A1A40", color: "white", border: "none", borderRadius: 50, padding: "14px 40px", fontFamily: "'Fredoka One', cursive", fontSize: 18, cursor: "pointer", boxShadow: "0 6px 0 rgba(0,0,0,0.3)", letterSpacing: "0.5px" }}
            >
              Play Again 🎮
            </button>
          </div>
        </div>
      )}
    </>
  );
}
