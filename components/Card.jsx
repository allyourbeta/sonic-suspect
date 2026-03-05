const COLORS = ["card-color-0","card-color-1","card-color-2","card-color-3","card-color-4"];

export default function Card({ character, isRevealed, isActive, isDisabled, isShaking, buzzFill, onClick, colorIndex }) {
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
  const stateClass = isActive ? "active" : isDisabled ? "disabled" : "";
  const shakeClass = isShaking ? "shake" : "";

  return (
    <div
      style={{ width: "100%", cursor: isDisabled ? "default" : "pointer" }}
      onClick={isDisabled ? undefined : onClick}
    >
      <div className={`card-face ${color} ${stateClass} ${shakeClass}`}>
        {isActive ? (
          <>
            <div className="soundbars">
              {[10,20,14,24,12].map((h, i) => (
                <div key={i} className="bar" style={{ height: h, animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
            <div className="card-hint-pick">Pick a name →</div>
            {/* Buzz window progress bar */}
            <div className="buzz-bar-track">
              <div
                className="buzz-bar-fill"
                style={{ width: `${buzzFill}%`, transition: buzzFill < 100 ? "width 1s linear" : "none" }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="card-emoji" style={{ opacity: isDisabled ? 0.2 : 0.35 }}>🎧</div>
            <div className="card-hint" style={{ opacity: isDisabled ? 0.3 : 1 }}>Tap to hear</div>
          </>
        )}
      </div>
    </div>
  );
}
