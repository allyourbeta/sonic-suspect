const COLORS = ["card-color-0","card-color-1","card-color-2","card-color-3","card-color-4"];

export default function Card({ character, isRevealed, isPlaying, isSelected, isMatched, onClick, colorIndex }) {
  // Revealed — show character emoji + name, matching the name panel
  if (isRevealed) {
    return (
      <div style={{ width: "100%" }}>
        <div className="card-revealed">
          <div style={{ fontSize: 48 }}>{character.emoji}</div>
          <div className="card-revealed-name">{character.name.replace("The ", "")}</div>
        </div>
      </div>
    );
  }

  const color = COLORS[colorIndex % 5];
  const state = isPlaying ? "playing" : isSelected ? "selected" : "";

  return (
    <div style={{ width: "100%", cursor: isMatched ? "default" : "pointer" }}
      onClick={isMatched ? undefined : onClick}>
      <div className={`card-face ${color} ${state}`}>
        {isPlaying ? (
          <div className="soundbars">
            {[10,20,14,24,12].map((h, i) => (
              <div key={i} className="bar" style={{ height: h, animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : isSelected ? (
          <>
            <div className="card-emoji" style={{ opacity: 0.35 }}>🎧</div>
            <div className="card-hint-pick">Pick a name →</div>
          </>
        ) : (
          <>
            <div className="card-emoji" style={{ opacity: 0.35 }}>🎧</div>
            <div className="card-hint">Tap to hear</div>
          </>
        )}
      </div>
    </div>
  );
}
