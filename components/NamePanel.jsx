export default function NamePanel({ characters, matched, activeCard, onNameClick }) {
  // Panel is "live" when a card is active and waiting for a name pick
  const isLive = activeCard !== null;

  return (
    <>
      {/* Desktop — badge list */}
      <div className="name-panel">
        {characters.map(c => {
          const isMatched = !!matched[c.id];
          return (
            <div
              key={c.id}
              className={`badge ${isMatched ? "matched" : ""} ${isLive && !isMatched ? "live" : ""}`}
              onClick={isMatched || !isLive ? undefined : () => onNameClick(c.id)}
            >
              <span className="badge-em">{c.emoji}</span>
              <span className="badge-nm">{c.name}</span>
              {isMatched
                ? <span className="badge-check">✓</span>
                : <span className="badge-arr">›</span>
              }
            </div>
          );
        })}
      </div>

      {/* Mobile — chips */}
      <div className="name-chips">
        {characters.map(c => {
          const isMatched = !!matched[c.id];
          return (
            <div
              key={c.id}
              className={`chip ${isMatched ? "matched" : ""} ${isLive && !isMatched ? "live" : ""}`}
              onClick={isMatched || !isLive ? undefined : () => onNameClick(c.id)}
            >
              <span>{c.emoji}</span>
              <span>{c.name}</span>
              {isMatched && <span style={{ color: "var(--correct)", fontWeight: 900 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}
