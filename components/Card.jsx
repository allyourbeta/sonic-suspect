import { useState } from "react";
import { CHARACTERS } from "../lib/characters";

const CARD_COLORS = ["--card-1", "--card-2", "--card-3", "--card-4", "--card-5", "--card-6"];
const CARD_SHADOWS = ["--shadow-1", "--shadow-2", "--shadow-3", "--shadow-4", "--shadow-5", "--shadow-6"];

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
      style={{ borderRadius: "50%", display: "block" }}
    />
  );
}

export default function Card({ character, isRevealed, isPlaying, isSelected, isMatched, onClick, colorIndex }) {
  const cardColor = `var(${CARD_COLORS[colorIndex % 6]})`;
  const shadowColor = `var(${CARD_SHADOWS[colorIndex % 6]})`;

  return (
    <div onClick={onClick} style={{ width: "100%", aspectRatio: "1", cursor: isMatched ? "default" : "pointer", perspective: "600px", userSelect: "none" }}>
      <div style={{
        position: "relative", width: "100%", height: "100%",
        transformStyle: "preserve-3d",
        transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
        transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          borderRadius: 20, background: cardColor,
          border: isSelected ? "3px solid var(--navy)" : isPlaying ? "3px solid var(--navy)" : "none",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6,
          boxShadow: `0 6px 0 ${shadowColor}`,
          transition: "all 0.2s ease",
        }}>
          {isPlaying ? (
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 30 }}>
              {[14, 22, 18, 26, 16].map((h, i) => (
                <div key={i} style={{
                  width: 5, height: h, background: "white", borderRadius: 3,
                  animation: `soundbar 0.5s ${i * 0.08}s ease-in-out infinite alternate`,
                }} />
              ))}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, opacity: 0.9 }}>🎭</div>
              <div style={{ color: "white", fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.85 }}>
                {isSelected ? "pick a name →" : "tap to hear"}
              </div>
            </>
          )}
        </div>

        <div style={{
          position: "absolute", inset: 0, backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)", borderRadius: 20,
          background: "white", border: "3px solid var(--correct)",
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6,
          boxShadow: "0 6px 0 var(--shadow-3)",
        }}>
          <AvatarImg name={character.name} size={52} />
          <div style={{ color: "var(--navy)", fontSize: 10, fontWeight: 800, textAlign: "center", padding: "0 6px", lineHeight: 1.3, letterSpacing: "0.03em" }}>
            {character.name.replace("The ", "")}
          </div>
        </div>
      </div>
    </div>
  );
}
