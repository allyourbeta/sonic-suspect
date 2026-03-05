const PENALTY = 5;
function fmt(s) {
  return `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
}

export default function WinScreen({ elapsed, wrongGuesses, onPlayAgain }) {
  const score = elapsed + wrongGuesses * PENALTY;
  return (
    <div className="win-overlay">
      <div className="win-card">
        <div style={{ fontSize: 64 }}>🏆</div>
        <div className="win-title">You got them all!</div>
        <div className="win-subtitle">Your ears are sharper than most.</div>
        <div className="win-scores">
          <div className="win-block">
            <div className="win-val" style={{ color: "#0891B2" }}>{fmt(elapsed)}</div>
            <div className="win-lbl">Time</div>
          </div>
          <div className="win-div">+</div>
          <div className="win-block">
            <div className="win-val" style={{ color: "var(--wrong)" }}>{wrongGuesses * PENALTY}s</div>
            <div className="win-lbl">{wrongGuesses} wrong ×{PENALTY}s</div>
          </div>
          <div className="win-div">=</div>
          <div className="win-block">
            <div className="win-val" style={{ color: "var(--amber)" }}>{fmt(score)}</div>
            <div className="win-lbl">Final Score</div>
          </div>
        </div>
        <button className="play-btn" onClick={onPlayAgain}>Play Again →</button>
      </div>
    </div>
  );
}
