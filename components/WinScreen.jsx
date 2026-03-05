const WRONG_PENALTY = 10;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function WinScreen({ elapsed, wrongGuesses, onPlayAgain }) {
  const score = elapsed + wrongGuesses * WRONG_PENALTY;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(26,26,64,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }}>
      <div style={{
        background: "white", border: "4px solid var(--navy)",
        borderRadius: 24, padding: "48px 40px", textAlign: "center",
        maxWidth: 440, width: "90%",
        boxShadow: "0 0 0 8px var(--card-4), 0 12px 40px rgba(26,26,64,0.3)",
        animation: "winPop 0.4s ease forwards",
      }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
        <h2 className="font-display" style={{ color: "var(--navy)", fontSize: 30, margin: "0 0 8px" }}>
          You got them all!
        </h2>
        <p style={{ color: "var(--navy)", margin: "0 0 32px", fontSize: 14, opacity: 0.5 }}>
          Your ears are sharper than most.
        </p>
        <div style={{
          display: "flex", gap: 0, justifyContent: "center", alignItems: "center",
          marginBottom: 32, background: "var(--bg)", borderRadius: 16, padding: "20px 24px",
        }}>
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ color: "var(--score-time)", fontSize: 30 }}>{formatTime(elapsed)}</div>
            <div style={{ color: "var(--navy)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4, opacity: 0.4 }}>time</div>
          </div>
          <div style={{ color: "var(--navy)", fontSize: 24, padding: "0 8px", opacity: 0.2 }}>+</div>
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ color: "var(--score-penalty)", fontSize: 30 }}>{wrongGuesses * WRONG_PENALTY}s</div>
            <div style={{ color: "var(--navy)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4, opacity: 0.4 }}>{wrongGuesses} wrong ×{WRONG_PENALTY}s</div>
          </div>
          <div style={{ color: "var(--navy)", fontSize: 24, padding: "0 8px", opacity: 0.2 }}>=</div>
          <div style={{ flex: 1 }}>
            <div className="font-display" style={{ color: "var(--score-final)", fontSize: 30 }}>{formatTime(score)}</div>
            <div style={{ color: "var(--navy)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4, opacity: 0.4 }}>final score</div>
          </div>
        </div>
        <button onClick={onPlayAgain} className="font-display" style={{
          padding: "14px 36px", background: "var(--card-1)", border: "none", borderRadius: 14,
          color: "white", fontSize: 16, cursor: "pointer", letterSpacing: "0.03em",
          boxShadow: "0 4px 0 var(--shadow-1)", transition: "transform 0.15s",
        }}>
          Play Again
        </button>
      </div>
    </div>
  );
}
