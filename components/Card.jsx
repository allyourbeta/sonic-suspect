const COLORS = ["card-color-0","card-color-1","card-color-2","card-color-3","card-color-4"];

export default function Card({
  character, isRevealed, isActive, isPlaying, isDisabled,
  isWrong, buzzFill, onClick, colorIndex
}) {
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

  // Wrong guess — red flash with penalty ON the card
  if (isWrong) {
    return (
      <div style={{ width: "100%" }}>
        <div className="card-face card-wrong shake">
          <div className="card-wrong-label">+5s</div>
        </div>
      </div>
    );
  }

  let stateClass = "";
  if (isActive && isPlaying)  stateClass = "active-playing";
  if (isActive && !isPlaying) stateClass = "active-waiting";
  if (isDisabled)             stateClass = "disabled";

  return (
    <div style={{ width:"100%", cursor: isDisabled ? "default" : "pointer" }}
      onClick={isDisabled ? undefined : onClick}>
      <div className={`card-face ${color} ${stateClass}`}>

        {/* State: audio playing */}
        {isActive && isPlaying && (
          <>
            <div className="soundbars">
              {[10,20,14,24,12].map((h, i) => (
                <div key={i} className="bar" style={{ height: h, animationDelay: `${i*0.08}s` }} />
              ))}
            </div>
            <div className="buzz-bar-track">
              <div className="buzz-bar-fill"
                style={{ width:`${buzzFill}%`, transition: buzzFill < 100 ? "width 1s linear" : "none" }} />
            </div>
          </>
        )}

        {/* State: audio done, waiting for name pick — focus shifts to panel */}
        {isActive && !isPlaying && (
          <>
            <div className="card-emoji" style={{ opacity: 0.5 }}>👂</div>
            <div className="card-hint-pick">Pick a name →</div>
            <div className="buzz-bar-track">
              <div className="buzz-bar-fill"
                style={{ width:`${buzzFill}%`, transition: buzzFill < 100 ? "width 1s linear" : "none" }} />
            </div>
          </>
        )}

        {/* State: idle or disabled */}
        {!isActive && (
          <>
            <div className="card-emoji" style={{ opacity: isDisabled ? 0.18 : 0.35 }}>🎧</div>
            <div className="card-hint"  style={{ opacity: isDisabled ? 0.25 : 1 }}>Tap to hear</div>
          </>
        )}

      </div>
    </div>
  );
}
