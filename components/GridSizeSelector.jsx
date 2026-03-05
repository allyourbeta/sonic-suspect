export default function GridSizeSelector({ gridSize, onSelect }) {
  return (
    <div className="toggle-wrap">
      <div className="toggle">
        {[4, 9].map(size => (
          <button
            key={size}
            className={`tog ${gridSize === size ? "active" : "inactive"}`}
            onClick={() => onSelect(size)}
          >
            {size === 4 ? "2×2" : "3×3"}
          </button>
        ))}
      </div>
    </div>
  );
}
