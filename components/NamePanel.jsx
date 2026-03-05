function NameTag({ character, isMatched, isSelected, onClick }) {
  return (
    <div onClick={isMatched ? undefined : onClick} style={{
      padding: "8px 12px", borderRadius: 10,
      background: isMatched ? "transparent" : isSelected ? "var(--card-4)" : "white",
      border: isMatched ? "none" : isSelected ? "2px solid var(--navy)" : "2px solid transparent",
      color: "var(--navy)",
      fontSize: 13, fontWeight: 800,
      cursor: isMatched ? "default" : "pointer",
      textDecoration: isMatched ? "line-through" : "none",
      opacity: isMatched ? 0.4 : 1,
      transition: "all 0.15s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontSize: 15, lineHeight: 1 }}>{character.emoji}</span>
      <span style={{ flex: 1 }}>{character.name}</span>
      {isMatched && <span style={{ color: "var(--correct)", fontSize: 13 }}>✓</span>}
    </div>
  );
}

export default function NamePanel({ characters, matched, selectedName, onNameClick }) {
  return (
    <div style={{ width: 230, flexShrink: 0, background: "white", borderRadius: 16, overflow: "hidden", position: "sticky", top: 20, boxShadow: "0 4px 0 var(--shadow-5)" }}>
      <div style={{ background: "var(--navy)", padding: "10px 14px", color: "white", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Who do you hear?
      </div>
      <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        {characters.map(character => (
          <NameTag
            key={character.id}
            character={character}
            isMatched={!!matched[character.id]}
            isSelected={selectedName === character.id}
            onClick={() => onNameClick(character.id)}
          />
        ))}
      </div>
    </div>
  );
}
