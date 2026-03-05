import { useState } from "react";
import { CHARACTERS } from "../lib/characters";

const CARD_COLORS = ["card-color-0","card-color-1","card-color-2","card-color-3","card-color-4"];

function AvatarImg({ name, size }) {
  const [failed, setFailed] = useState(false);
  const ch = CHARACTERS.find(c => c.name === name);
  if (failed) return <span style={{ fontSize: size * 0.7 }}>{ch?.emoji || "?"}</span>;
  return (
    <img
      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: "50%", display: "block", border: "2px solid var(--correct)" }}
    />
  );
}

export default function Card({ character, isRevealed, isPlaying, isSelected, isMatched, onClick, colorIndex }) {
  const colorClass = CARD_COLORS[colorIndex % 5];
  const stateClass = isPlaying ? "playing" : isSelected ? "selected" : "";

  if (isRevealed) {
    return (
      <div style={{ width: "100%", userSelect: "none" }}>
        <div className="card-revealed">
          <AvatarImg name={character.name} size={52} />
          <div className="card-revealed-name">{character.name.replace("The ", "")}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={isMatched ? undefined : onClick}
      style={{ width: "100%", cursor: isMatched ? "default" : "pointer", userSelect: "none" }}
    >
      <div className={`card-face-down ${colorClass} ${stateClass}`}>
        {isPlaying ? (
          <div className="sound-bars">
            {[14, 22, 18, 26, 16].map((h, i) => (
              <div key={i} className="sound-bar" style={{ height: h, animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : isSelected ? (
          <div className="card-label-selected">pick a name →</div>
        ) : (
          <>
            <div className="card-emoji">{character.emoji}</div>
            <div className="card-label">tap to hear</div>
          </>
        )}
      </div>
    </div>
  );
}
