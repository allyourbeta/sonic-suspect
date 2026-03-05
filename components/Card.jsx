import { useState } from "react";
import { CHARACTERS } from "../lib/characters";

const CARD_COLORS = ["card-color-0", "card-color-1", "card-color-2", "card-color-3", "card-color-4"];

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

  return (
    <div onClick={isMatched ? undefined : onClick} style={{ width: "100%", cursor: isMatched ? "default" : "pointer", perspective: "600px", userSelect: "none" }}>
      <div style={{
        position: "relative", width: "100%", aspectRatio: "1",
        transformStyle: "preserve-3d",
        transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
        transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div className={`card-face-down ${colorClass} ${stateClass}`} style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
        }}>
          {isPlaying ? (
            <div className="sound-bars">
              {[14, 22, 18, 26, 16].map((h, i) => (
                <div key={i} className="sound-bar" style={{ height: h, animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          ) : isSelected ? (
            <div className="card-label">pick a name →</div>
          ) : (
            <>
              <div style={{ fontSize: 28, opacity: 0.4 }}>🎭</div>
              <div className="card-label">tap to hear</div>
            </>
          )}
        </div>

        <div className="card-revealed" style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}>
          <AvatarImg name={character.name} size={52} />
          <div style={{ color: "var(--text)", fontSize: 11, fontWeight: 700, textAlign: "center", padding: "0 8px", lineHeight: 1.3 }}>
            {character.name.replace("The ", "")}
          </div>
        </div>
      </div>
    </div>
  );
}
