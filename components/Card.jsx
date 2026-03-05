import { useState } from "react";
import { CHARACTERS } from "../lib/characters";

const COLORS = ["card-color-0","card-color-1","card-color-2","card-color-3","card-color-4"];

function Avatar({ name, size }) {
  const [failed, setFailed] = useState(false);
  const ch = CHARACTERS.find(c => c.name === name);
  if (failed) return <span style={{ fontSize: size * 0.7 }}>{ch?.emoji || "?"}</span>;
  return (
    <img
      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`}
      alt={name} width={size} height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: "50%", border: "2px solid var(--correct)", display: "block" }}
    />
  );
}

export default function Card({ character, isRevealed, isPlaying, isSelected, isMatched, onClick, colorIndex }) {
  if (isRevealed) {
    return (
      <div style={{ width: "100%" }}>
        <div className="card-revealed">
          <Avatar name={character.name} size={52} />
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
            <div className="card-emoji">{character.emoji}</div>
            <div className="card-hint-pick">Pick a name →</div>
          </>
        ) : (
          <>
            <div className="card-emoji">{character.emoji}</div>
            <div className="card-hint">Tap to hear</div>
          </>
        )}
      </div>
    </div>
  );
}
