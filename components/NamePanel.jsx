export default function NamePanel({ characters, matched, selectedName, selectedCard, onNameClick }) {
  return (
    <>
      {/* Desktop — badge list */}
      <div className="name-panel">
        {characters.map(c => {
          const isMatched = !!matched[c.id];
          const isActive  = selectedName === c.id;
          return (
            <div
              key={c.id}
              className={`badge ${isMatched ? "matched" : ""} ${isActive ? "active" : ""}`}
              onClick={isMatched ? undefined : () => onNameClick(c.id)}
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
          const isActive  = selectedName === c.id;
          return (
            <div
              key={c.id}
              className={`chip ${isMatched ? "matched" : ""} ${isActive ? "active" : ""}`}
              onClick={isMatched ? undefined : () => onNameClick(c.id)}
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
