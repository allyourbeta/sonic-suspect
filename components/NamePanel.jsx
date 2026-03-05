function NameItem({ character, isMatched, isSelected, onClick }) {
  const cls = `name-item ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""}`;
  return (
    <div className={cls} onClick={isMatched ? undefined : onClick}>
      <span style={{ fontSize: 16 }}>{character.emoji}</span>
      <span style={{ flex: 1 }}>{character.name}</span>
      {isMatched && <span style={{ color: "var(--correct)" }}>✓</span>}
    </div>
  );
}

function NameChip({ character, isMatched, isSelected, onClick }) {
  const cls = `name-chip ${isMatched ? "matched" : ""} ${isSelected ? "selected" : ""}`;
  return (
    <div className={cls} onClick={isMatched ? undefined : onClick}>
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
          {urgent ? "👇 PICK A NAME" : "WHO DO YOU HEAR?"}
        </div>
        {characters.map(character => (
          <NameItem
            key={character.id}
            character={character}
            isMatched={!!matched[character.id]}
            isSelected={selectedName === character.id}
            onClick={() => onNameClick(character.id)}
          />
        ))}
      </div>

      <div className="name-panel-mobile">
        {characters.map(character => (
          <NameChip
            key={character.id}
            character={character}
            isMatched={!!matched[character.id]}
            isSelected={selectedName === character.id}
            onClick={() => onNameClick(character.id)}
          />
        ))}
      </div>
    </>
  );
}
