const GRID_OPTIONS = [
  { label: "2\u00d72", size: 4 },
  { label: "3\u00d73", size: 9 },
  { label: "4\u00d74", size: 16 },
];

export default function GridSizeSelector({ gridSize, onSelect }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 20px 0", display: "flex", gap: 6 }}>
      {GRID_OPTIONS.map(({ label, size }) => (
        <button
          key={size}
          onClick={() => onSelect(size)}
          style={{
            background: gridSize === size ? "var(--card-4)" : "white",
            color: "var(--navy)",
            border: `2px solid ${gridSize === size ? "var(--card-4)" : "var(--navy)"}`,
            borderRadius: 50, padding: "5px 16px", fontSize: 13, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.04em",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
