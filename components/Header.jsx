function fmt(s) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function Header({ elapsed, wrongGuesses, penalty, cards, matched, onReset }) {
  const score = elapsed + wrongGuesses * penalty;
  const matchedCount = Object.keys(matched).length;
  return (
    <div className="header">
      <div>
        <div className="logo-name">🎭 Sonic Suspect</div>
        <div className="logo-sub">powered by <a href="https://cartesia.ai" target="_blank" rel="noreferrer">Cartesia Sonic‑3</a></div>
      </div>
      <div className="header-right">
        {[
          { lbl: "TIME",  val: fmt(elapsed),      color: "#0891B2",        cls: "stat stat-time"  },
          { lbl: "WRONG", val: wrongGuesses, sub: `×${penalty}s`, color: "var(--wrong)", cls: "stat stat-wrong" },
          { lbl: "SCORE", val: fmt(score),         color: "var(--amber)",   cls: "stat"            },
          { lbl: "FOUND", val: matchedCount, sub: `/${cards.length}`, color: "var(--correct)", cls: "stat" },
        ].map(({ lbl, val, sub, color, cls }) => (
          <div key={lbl} className={cls}>
            <div className="stat-lbl">{lbl}</div>
            <div className="stat-val" style={{ color }}>
              {val}{sub && <span className="stat-sub">{sub}</span>}
            </div>
          </div>
        ))}
        <button className="reset-btn" onClick={onReset}>↺ Reset</button>
      </div>
    </div>
  );
}
