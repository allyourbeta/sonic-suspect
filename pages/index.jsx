import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { CHARACTERS } from "../lib/characters";
import Card from "../components/Card";
import NamePanel from "../components/NamePanel";
import WinScreen from "../components/WinScreen";
import Onboarding from "../components/Onboarding";
import GridSizeSelector from "../components/GridSizeSelector";

const WRONG_PENALTY = 5;
const GRID_COLS = { 4: 2, 9: 3 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(s) {
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

export default function Home() {
  const [gridSize, setGridSize]         = useState(9);
  const [cards, setCards]               = useState(() => shuffle(CHARACTERS).slice(0, 9));
  const [showOnboarding, setShowOnboarding] = useState(true);
  const nameList = [...cards].sort((a, b) => a.name.localeCompare(b.name));
  const gridCols = GRID_COLS[gridSize] ?? 3;

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

  const audioRef    = useRef(null);
  const timerRef    = useRef(null);
  const feedbackRef = useRef(null);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (started && Object.keys(matched).length === cards.length) {
      setFinished(true);
      clearInterval(timerRef.current);
    }
  }, [matched, started, cards.length]);

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
      if (audioRef.current) { audioRef.current.pause(); URL.revokeObjectURL(audioRef.current.src); audioRef.current = null; }
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
    if (playing || matched[charId]) return;
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
      setFeedback({ type: "wrong", msg: `+${WRONG_PENALTY} seconds ⚡` });
    }
    setSelectedCard(null);
    setSelectedName(null);
    feedbackRef.current = setTimeout(() => setFeedback(null), 1800);
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
        <meta name="description" content="A voice matching game powered by Cartesia Sonic-3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* HEADER */}
      <div className="header">
        <div>
          <div className="logo-name">🎭 Sonic Suspect</div>
          <div className="logo-sub">powered by <a href="https://cartesia.ai" target="_blank" rel="noreferrer">Cartesia Sonic‑3</a></div>
        </div>
        <div className="header-right">
          {[
            { lbl: "TIME",  val: fmt(elapsed),     color: "#0891B2", cls: "stat stat-time" },
            { lbl: "WRONG", val: wrongGuesses, sub: `×${WRONG_PENALTY}s`, color: "var(--wrong)", cls: "stat stat-wrong" },
            { lbl: "SCORE", val: fmt(score),        color: "var(--amber)", cls: "stat" },
            { lbl: "FOUND", val: matchedCount, sub: `/${cards.length}`,   color: "var(--correct)", cls: "stat" },
          ].map(({ lbl, val, sub, color, cls }) => (
            <div key={lbl} className={cls}>
              <div className="stat-lbl">{lbl}</div>
              <div className="stat-val" style={{ color }}>
                {val}{sub && <span className="stat-sub">{sub}</span>}
              </div>
            </div>
          ))}
          <button className="reset-btn" onClick={() => handleReset()}>↺ Reset</button>
        </div>
      </div>

      <div className="content-area">
        {apiError && (
          <div className="api-error">
            <span>⚠ {apiError}</span>
            <button onClick={() => setApiError(null)} style={{ background: "none", border: "none", color: "var(--wrong)", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>
        )}

        {feedback && <div className={`toast ${feedback.type}`}>{feedback.msg}</div>}

        <GridSizeSelector gridSize={gridSize} onSelect={(size) => handleReset(size)} />

        <div className="main-layout">
          <div className="card-grid" style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 220px))` }}>
            {cards.map((character, i) => (
              <Card
                key={character.id}
                character={character}
                colorIndex={i}
                isRevealed={!!revealed[character.id]}
                isPlaying={playing === character.id}
                isSelected={selectedCard === character.id}
                isMatched={!!matched[character.id]}
                onClick={() => handleCardClick(character.id)}
              />
            ))}
          </div>
          <NamePanel
            characters={nameList}
            matched={matched}
            selectedName={selectedName}
            selectedCard={selectedCard}
            onNameClick={handleNameClick}
          />
        </div>
      </div>

      {finished && <WinScreen elapsed={elapsed} wrongGuesses={wrongGuesses} onPlayAgain={() => handleReset()} />}
      {showOnboarding && <Onboarding onStart={() => setShowOnboarding(false)} />}
    </>
  );
}
