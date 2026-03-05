import { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import { CHARACTERS } from "../lib/characters";
import Card from "../components/Card";
import NamePanel from "../components/NamePanel";
import WinScreen from "../components/WinScreen";
import Onboarding from "../components/Onboarding";
import GridSizeSelector from "../components/GridSizeSelector";
import Header from "../components/Header";
import { playCelebration } from "../lib/celebration";

const WRONG_PENALTY = 5;
const BUZZ_WINDOW   = 7;  // seconds AFTER audio ends
const WRONG_FLASH   = 900;
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
  const [cards, setCards]                   = useState(CHARACTERS.slice(0, 9));
  const [showOnboarding, setShowOnboarding] = useState(true);

  const [matched, setMatched]               = useState({});
  const [revealed, setRevealed]             = useState({});

  const [activeCard, setActiveCard]         = useState(null);
  const [isPlaying, setIsPlaying]           = useState(false);
  const [buzzWindow, setBuzzWindow]         = useState(0);  // only counts during waiting phase

  const [wrongCard, setWrongCard]           = useState(null);
  const [apiError, setApiError]             = useState(null);

  const [elapsed, setElapsed]               = useState(0);
  const [started, setStarted]               = useState(false);
  const [finished, setFinished]             = useState(false);
  const [celebrating, setCelebrating]        = useState(false);
  const [wrongGuesses, setWrongGuesses]     = useState(0);

  const audioRef      = useRef(null);
  const gameTimerRef  = useRef(null);
  const buzzTimerRef  = useRef(null);
  const wrongTimerRef = useRef(null);

  const nameList = [...cards].sort((a, b) => a.name.localeCompare(b.name));
  const gridCols = GRID_COLS[gridSize] ?? 3;

  // Game clock
  useEffect(() => {
    if (started && !finished) {
      gameTimerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(gameTimerRef.current);
  }, [started, finished]);

  // Win detection — auto-complete at n-1, celebrate before win screen
  useEffect(() => {
    const matchedCount = Object.keys(matched).length;
    if (!started || matchedCount === 0) return;

    // Auto-complete: one card left — reveal it immediately by elimination
    if (matchedCount === cards.length - 1) {
      const lastCard = cards.find(c => !matched[c.id]);
      if (lastCard) {
        setTimeout(() => {
          setMatched(m => ({ ...m, [lastCard.id]: true }));
          setRevealed(r => ({ ...r, [lastCard.id]: true }));
        }, 400);
      }
      return;
    }

    // All matched — stop audio, play fanfare, then show win screen
    if (matchedCount === cards.length) {
      stopAudio();
      clearBuzzTimer();
      setActiveCard(null);
      setIsPlaying(false);
      setBuzzWindow(0);
      clearInterval(gameTimerRef.current);
      setCelebrating(true);
      playCelebration();
      setTimeout(() => {
        setCelebrating(false);
        setFinished(true);
      }, 1800);
    }
  }, [matched, started, cards.length]);

  // Initial shuffle (deferred to avoid hydration mismatch)
  useEffect(() => {
    setCards(shuffle(CHARACTERS).slice(0, gridSize));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      try { URL.revokeObjectURL(audioRef.current.src); } catch (_) {}
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const clearBuzzTimer = useCallback(() => {
    if (buzzTimerRef.current) {
      clearInterval(buzzTimerRef.current);
      buzzTimerRef.current = null;
    }
  }, []);

  // Start the 7-second window AFTER audio ends
  const startBuzzTimer = useCallback(() => {
    clearBuzzTimer();
    setBuzzWindow(BUZZ_WINDOW);
    buzzTimerRef.current = setInterval(() => {
      setBuzzWindow(prev => {
        if (prev <= 1) {
          clearInterval(buzzTimerRef.current);
          buzzTimerRef.current = null;
          // Time's up — reset everything
          setActiveCard(null);
          setBuzzWindow(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearBuzzTimer]);

  const resetListening = useCallback(() => {
    stopAudio();
    clearBuzzTimer();
    setActiveCard(null);
    setIsPlaying(false);
    setBuzzWindow(0);
  }, [stopAudio, clearBuzzTimer]);

  const handleCardClick = useCallback(async (charId) => {
    if (matched[charId] || wrongCard) return;
    if (activeCard !== null && activeCard !== charId) return;

    if (!started) setStarted(true);
    setApiError(null);

    const character = CHARACTERS.find(c => c.id === charId);
    if (!character) return;

    // Stop any existing audio + buzz timer before starting fresh
    clearBuzzTimer();
    stopAudio();
    setBuzzWindow(0);

    setActiveCard(charId);
    setIsPlaying(true);

    try {
      const url = await fetchAudio(character.phrases[0], character.voiceId, character.emotion, character.speed);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => {
        // Play failed (e.g. headless browser) — treat as instant end
        audioRef.current = null;
        setIsPlaying(false);
        startBuzzTimer();
      });
      audio.onended = () => {
        audioRef.current = null;
        setIsPlaying(false);
        startBuzzTimer();
      };
      // Fallback: if audio is very short and onended doesn't fire within 2s, move on
      audio.addEventListener('error', () => {
        audioRef.current = null;
        setIsPlaying(false);
        startBuzzTimer();
      });
    } catch (err) {
      setApiError(err.message);
      resetListening();
    }
  }, [matched, wrongCard, activeCard, started, stopAudio, clearBuzzTimer, startBuzzTimer, resetListening]);

  const handleNameClick = useCallback((nameId) => {
    if (!activeCard || matched[nameId] || wrongCard) return;

    const isCorrect = activeCard === nameId;
    const cardId = activeCard;
    const character = CHARACTERS.find(c => c.id === cardId);

    stopAudio();
    clearBuzzTimer();
    setActiveCard(null);
    setIsPlaying(false);
    setBuzzWindow(0);

    if (isCorrect) {
      setMatched(m => ({ ...m, [cardId]: true }));
      setRevealed(r => ({ ...r, [cardId]: true }));
    } else {
      setWrongGuesses(w => w + 1);
      setWrongCard(cardId);
      if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = setTimeout(() => setWrongCard(null), WRONG_FLASH);
    }
  }, [activeCard, matched, wrongCard, stopAudio, clearBuzzTimer]);

  const handleReset = useCallback((newSize) => {
    const size = newSize ?? gridSize;
    if (newSize) setGridSize(newSize);
    resetListening();
    clearInterval(gameTimerRef.current);
    if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
    setCards(shuffle(CHARACTERS).slice(0, size));
    setMatched({}); setRevealed({}); setWrongCard(null);
    setWrongGuesses(0); setElapsed(0); setStarted(false);
    setFinished(false); setCelebrating(false); setApiError(null);
  }, [gridSize, resetListening]);

  const buzzFill = (buzzWindow / BUZZ_WINDOW) * 100;

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
            <button onClick={() => setApiError(null)}
              style={{ background:"none",border:"none",color:"var(--wrong)",cursor:"pointer",fontSize:18 }}>×</button>
          </div>
        )}

        <GridSizeSelector gridSize={gridSize} onSelect={(size) => handleReset(size)} />

        <div className="main-layout">
          <div className={`card-grid${celebrating ? ' celebrating' : ''}`}
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 220px))` }}>
            {cards.map((character, i) => (
              <Card
                key={character.id}
                character={character}
                colorIndex={i}
                isRevealed={!!revealed[character.id]}
                isActive={activeCard === character.id}
                isPlaying={activeCard === character.id && isPlaying}
                isDisabled={activeCard !== null && activeCard !== character.id && !revealed[character.id]}
                isWrong={wrongCard === character.id}
                buzzFill={activeCard === character.id ? buzzFill : 0}
                onClick={() => handleCardClick(character.id)}
              />
            ))}
          </div>
          <NamePanel
            characters={nameList}
            matched={matched}
            activeCard={activeCard}
            isPlaying={isPlaying}
            onNameClick={handleNameClick}
          />
        </div>
      </div>

      {finished && <WinScreen elapsed={elapsed} wrongGuesses={wrongGuesses} onPlayAgain={() => handleReset()} />}
      {showOnboarding && <Onboarding onStart={() => setShowOnboarding(false)} />}
    </>
  );
}
