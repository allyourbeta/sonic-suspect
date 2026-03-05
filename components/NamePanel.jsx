// NamePanel
// - No active card:    all badges dimmed, not clickable
// - Active + playing:  badges available (pre-guess allowed) but NOT highlighted
// - Active + waiting:  badges highlighted — visual focus shifts here

export default function NamePanel({ characters, matched, activeCard, isPlaying, onNameClick }) {
  const hasActive  = activeCard !== null;
  const isWaiting  = hasActive && !isPlaying; // audio done, awaiting pick

  return (
    <>
      {/* Desktop — badge list */}
      <div className="name-panel">
        {characters.map(c => {
          const isMatched   = !!matched[c.id];
          const canClick    = hasActive && !isMatched;
          const badgeClass  = isMatched   ? "matched"
                            : isWaiting   ? "live waiting"
                            : hasActive   ? "live"
                            : "";          // idle — dimmed via CSS

          return (
            <div key={c.id}
              className={`badge ${badgeClass}`}
              onClick={canClick ? () => onNameClick(c.id) : undefined}>
              <span className="badge-em">{c.emoji}</span>
              <span className="badge-nm">{c.name}</span>
              {isMatched
                ? <span className="badge-check">✓</span>
                : <span className="badge-arr">›</span>}
            </div>
          );
        })}
      </div>

      {/* Mobile — chips */}
      <div className="name-chips">
        {characters.map(c => {
          const isMatched  = !!matched[c.id];
          const canClick   = hasActive && !isMatched;
          const chipClass  = isMatched  ? "matched"
                           : isWaiting  ? "live waiting"
                           : hasActive  ? "live"
                           : "";

          return (
            <div key={c.id}
              className={`chip ${chipClass}`}
              onClick={canClick ? () => onNameClick(c.id) : undefined}>
              <span>{c.emoji}</span>
              <span>{c.name}</span>
              {isMatched && <span style={{ color:"var(--correct)", fontWeight:900 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}
