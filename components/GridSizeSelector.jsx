const GRID_OPTIONS = [
  { label: "2\u00d72", size: 4 },
  { label: "3\u00d73", size: 9 },
];

export default function GridSizeSelector({ gridSize, onSelect }) {
  return (
    <div className="grid-size-selector">
      {GRID_OPTIONS.map(({ label, size }) => (
        <button
          key={size}
          className={`grid-size-btn ${gridSize === size ? "active" : "inactive"}`}
          onClick={() => onSelect(size)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
