function NameItem({ character, isMatched, isSelected, onClick }) {
  return (
    <div
      className={`name-item ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""}`}
      onClick={isMatched ? undefined : onClick}
    >
      <span style={{ fontSize: 16 }}>{character.emoji}</span>
      <span style={{ flex: 1 }}>{character.name}</span>
      {isMatched && <span style={{ color: "var(--correct)", fontWeight: 700 }}>✓</span>}
    </div>
  );
}

function NameChip({ character, isMatched, isSelected, onClick }) {
  return (
    <div
      className={`name-chip ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""}`}
      onClick={isMatched ? undefined : onClick}
    >
      <span>{character.emoji}</span>
      <span>{character.name}</span>
      {isMatched && <span style={{ color: "var(--correct)" }}>✓</span>}
    </div>
  );
}

export default function NamePanel({ characters, matched, selectedName, selectedCard, onNameClick }) {
  const urgent = selectedCard !== null;
  return (
    <>
      <div className="name-panel-desktop">
        <div className={`name-panel-header ${urgent ? "urgent" : ""}`}>
          {urgent ? "👇 Pick a name" : "Who do you hear?"}
        </div>
        {characters.map(c => (
          <NameItem key={c.id} character={c}
            isMatched={!!matched[c.id]} isSelected={selectedName === c.id}
            onClick={() => onNameClick(c.id)} />
        ))}
      </div>
      <div className="name-panel-mobile">
        {characters.map(c => (
          <NameChip key={c.id} character={c}
            isMatched={!!matched[c.id]} isSelected={selectedName === c.id}
            onClick={() => onNameClick(c.id)} />
        ))}
      </div>
    </>
  );
}
