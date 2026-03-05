const WRONG_PENALTY = 10;

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function StatBlock({ value, label, color }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ color: "var(--text-muted)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function WinScreen({ elapsed, wrongGuesses, onPlayAgain }) {
  const score = elapsed + wrongGuesses * WRONG_PENALTY;
  return (
    <div className="win-overlay">
      <div className="win-card">
        <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>
          You got them all!
        </div>
        <p style={{ color: "var(--text-muted)", margin: "0 0 32px", fontSize: 14, fontWeight: 500 }}>
          Your ears are sharper than most.
        </p>
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          marginBottom: 32, background: "var(--bg)", borderRadius: 16, padding: "20px 24px",
        }}>
          <StatBlock value={formatTime(elapsed)} label="time" color="var(--selected-border)" />
          <div style={{ color: "var(--text-light)", fontSize: 24 }}>+</div>
          <StatBlock value={`${wrongGuesses * WRONG_PENALTY}s`} label={`${wrongGuesses} wrong ×${WRONG_PENALTY}s`} color="var(--wrong)" />
          <div style={{ color: "var(--text-light)", fontSize: 24 }}>=</div>
          <StatBlock value={formatTime(score)} label="final score" color="var(--navy)" />
        </div>
        <button
          onClick={onPlayAgain}
          style={{
            padding: "14px 40px", background: "var(--navy)", border: "none", borderRadius: 50,
            color: "white", fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 5px 0 rgba(0,0,0,0.3)", letterSpacing: "0.5px",
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
