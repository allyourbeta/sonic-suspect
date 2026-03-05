const STEPS = [
  { num: "1", icon: "\ud83d\udd0a", text: "Click any card to hear a mystery voice" },
  { num: "2", icon: "\ud83c\udfaf", text: "Pick the matching name from the panel" },
  { num: "3", icon: "\u26a1", text: "Wrong guess = +10 seconds penalty" },
];

export default function Onboarding({ onStart }) {
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div style={{ fontSize: 72, marginBottom: 12 }}>🎭</div>
        <div style={{
          fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800,
          color: "var(--navy)", marginBottom: 28,
        }}>
          Think you know a voice?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28, textAlign: "left" }}>
          {STEPS.map(({ num, icon, text }) => (
            <div key={num} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
                color: "var(--navy)", flexShrink: 0,
              }}>
                {num}
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", lineHeight: 1.5 }}>
                {icon} {text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 13, fontWeight: 500, marginBottom: 24 }}>
          Lowest time wins. Good luck.
        </div>
        <button
          onClick={onStart}
          style={{
            background: "var(--navy)", color: "white", border: "none",
            borderRadius: 50, padding: "14px 40px",
            fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 5px 0 rgba(0,0,0,0.3)",
            letterSpacing: "0.5px",
          }}
        >
          {"Let's Play \u2192"}
        </button>
      </div>
    </div>
  );
}
