function formatTime(s) {
  return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
}

const WRONG_PENALTY = 10;

export default function WinScreen({ elapsed, wrongGuesses, onPlayAgain }) {
  const score = elapsed + wrongGuesses * WRONG_PENALTY;
  return (
    <div className="win-overlay">
      <div className="win-card">
        <div style={{ fontSize: 64 }}>🏆</div>
        <div className="win-title">You got them all!</div>
        <div className="win-subtitle">Your ears are sharper than most.</div>
        <div className="win-scores">
          <div className="win-score-block">
            <div className="win-score-value" style={{ color: "#2EC4B6" }}>{formatTime(elapsed)}</div>
            <div className="win-score-label">Time</div>
          </div>
          <div className="win-divider">+</div>
          <div className="win-score-block">
            <div className="win-score-value" style={{ color: "var(--wrong)" }}>{wrongGuesses * WRONG_PENALTY}s</div>
            <div className="win-score-label">{wrongGuesses} wrong ×{WRONG_PENALTY}s</div>
          </div>
          <div className="win-divider">=</div>
          <div className="win-score-block">
            <div className="win-score-value" style={{ color: "var(--amber)" }}>{formatTime(score)}</div>
            <div className="win-score-label">Final Score</div>
          </div>
        </div>
        <button className="play-btn" onClick={onPlayAgain}>Play Again 🎮</button>
      </div>
    </div>
  );
}
