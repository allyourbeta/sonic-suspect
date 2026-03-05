import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { CHARACTERS } from "../lib/characters";
import Card from "../components/Card";
import NamePanel from "../components/NamePanel";
import WinScreen from "../components/WinScreen";
import Onboarding from "../components/Onboarding";
import GridSizeSelector from "../components/GridSizeSelector";
import Header from "../components/Header";

const WRONG_PENALTY = 5;
const BUZZ_WINDOW   = 7;
const GRID_COLS     = { 4: 2, 9: 3 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
  const [gridSize, setGridSize]             = useState(9);
  const [cards, setCards]                   = useState(() => shuffle(CHARACTERS).slice(0, 9));
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [matched, setMatched]               = useState({});
  const [revealed, setRevealed]             = useState({});
  const [activeCard, setActiveCard]         = useState(null);
  const [buzzWindow, setBuzzWindow]         = useState(0);
  const [shakingCard, setShakingCard]       = useState(null);
  const [feedback, setFeedback]             = useState(null);
  const [apiError, setApiError]             = useState(null);
  const [elapsed, setElapsed]               = useState(0);
  const [started, setStarted]               = useState(false);
  const [finished, setFinished]             = useState(false);
  const [wrongGuesses, setWrongGuesses]     = useState(0);

  const audioRef     = useRef(null);
  const gameTimerRef = useRef(null);
  const buzzTimerRef = useRef(null);
  const feedbackRef  = useRef(null);

  const nameList = [...cards].sort((a, b) => a.name.localeCompare(b.name));
  const gridCols = GRID_COLS[gridSize] ?? 3;

  // Game clock
  useEffect(() => {
    if (started && !finished) {
      gameTimerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(gameTimerRef.current);
  }, [started, finished]);

  // Win detection
  useEffect(() => {
    if (started && Object.keys(matched).length === cards.length) {
      setFinished(true);
      clearInterval(gameTimerRef.current);
    }
  }, [matched, started, cards.length]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      try { URL.revokeObjectURL(audioRef.current.src); } catch (_) {}
      audioRef.current = null;
    }
  }, []);

  const clearBuzzTimer = useCallback(() => {
    if (buzzTimerRef.current) { clearInterval(buzzTimerRef.current); buzzTimerRef.current = null; }
  }, []);

  const resetListening = useCallback(() => {
    stopAudio();
    clearBuzzTimer();
    setActiveCard(null);
    setBuzzWindow(0);
  }, [stopAudio, clearBuzzTimer]);

  const startBuzzTimer = useCallback(() => {
    clearBuzzTimer();
    setBuzzWindow(BUZZ_WINDOW);
    buzzTimerRef.current = setInterval(() => {
      setBuzzWindow(prev => {
        if (prev <= 1) {
          clearInterval(buzzTimerRef.current);
          buzzTimerRef.current = null;
          stopAudio();
          setActiveCard(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearBuzzTimer, stopAudio]);

  const handleCardClick = useCallback(async (charId) => {
    if (matched[charId]) return;
    // If a different card is active, ignore the tap
    if (activeCard !== null && activeCard !== charId) return;

    if (!started) setStarted(true);
    setApiError(null);

    const character = CHARACTERS.find(c => c.id === charId);
    if (!character) return;

    setActiveCard(charId);
    startBuzzTimer();
    stopAudio();

    try {
      const url = await fetchAudio(character.phrases[0], character.voiceId, character.emotion, character.speed);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => { audioRef.current = null; };
    } catch (err) {
      setApiError(err.message);
      resetListening();
    }
  }, [matched, activeCard, started, stopAudio, startBuzzTimer, resetListening]);

  const handleNameClick = useCallback((nameId) => {
    if (!activeCard || matched[nameId]) return;
    const isCorrect = activeCard === nameId;
    const character = CHARACTERS.find(c => c.id === activeCard);
    const cardId = activeCard;
    resetListening();
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    if (isCorrect) {
      setMatched(m => ({ ...m, [cardId]: true }));
      setRevealed(r => ({ ...r, [cardId]: true }));
      setFeedback({ type: "correct", msg: `✓ ${character.name}!` });
    } else {
      setWrongGuesses(w => w + 1);
      setShakingCard(cardId);
      setFeedback({ type: "wrong", msg: `+${WRONG_PENALTY} seconds` });
      setTimeout(() => setShakingCard(null), 500);
    }
    feedbackRef.current = setTimeout(() => setFeedback(null), 1600);
  }, [activeCard, matched, resetListening]);

  const handleReset = useCallback((newSize) => {
    const size = newSize ?? gridSize;
    if (newSize) setGridSize(newSize);
    resetListening();
    clearInterval(gameTimerRef.current);
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    setCards(shuffle(CHARACTERS).slice(0, size));
    setMatched({}); setRevealed({}); setShakingCard(null); setFeedback(null);
    setWrongGuesses(0); setElapsed(0); setStarted(false); setFinished(false); setApiError(null);
  }, [gridSize, resetListening]);

  const buzzFill = activeCard ? (buzzWindow / BUZZ_WINDOW) * 100 : 0;

  return (
    <>
      <Head>
        <title>Sonic Suspect — A Cartesia Voice Game</title>
        <meta name="description" content="A voice matching game powered by Cartesia Sonic-3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header
        elapsed={elapsed} wrongGuesses={wrongGuesses} penalty={WRONG_PENALTY}
        cards={cards} matched={matched} onReset={() => handleReset()}
      />

      <div className="content-area">
        {apiError && (
          <div className="api-error">
            <span>⚠ {apiError}</span>
            <button onClick={() => setApiError(null)} style={{ background:"none",border:"none",color:"var(--wrong)",cursor:"pointer",fontSize:18 }}>×</button>
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
                isActive={activeCard === character.id}
                isDisabled={activeCard !== null && activeCard !== character.id && !revealed[character.id]}
                isShaking={shakingCard === character.id}
                buzzFill={activeCard === character.id ? buzzFill : 0}
                onClick={() => handleCardClick(character.id)}
              />
            ))}
          </div>
          <NamePanel
            characters={nameList}
            matched={matched}
            activeCard={activeCard}
            onNameClick={handleNameClick}
          />
        </div>
      </div>

      {finished && <WinScreen elapsed={elapsed} wrongGuesses={wrongGuesses} onPlayAgain={() => handleReset()} />}
      {showOnboarding && <Onboarding onStart={() => setShowOnboarding(false)} />}
    </>
  );
}
