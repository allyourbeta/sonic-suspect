export default function Onboarding({ onStart }) {
  const steps = [
    { num: "1", icon: "\ud83d\udd0a", text: "Click any card to hear a mystery voice" },
    { num: "2", icon: "\ud83c\udfaf", text: "Pick the matching name from the panel" },
    { num: "3", icon: "\u26a1", text: "Wrong guess = +10 seconds penalty" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(26,26,64,0.85)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 300,
    }}>
      <div style={{
        background: "white", borderRadius: 28, padding: "48px 40px",
        textAlign: "center", maxWidth: 440, width: "90%",
        border: "4px solid var(--navy)",
        boxShadow: "0 0 0 8px var(--card-4), 0 12px 40px rgba(26,26,64,0.3)",
      }}>
        <div style={{ fontSize: 72, marginBottom: 12 }}>🎭</div>
        <div style={{
          fontFamily: "'Fredoka One', cursive", fontSize: 30,
          color: "var(--navy)", marginBottom: 28,
        }}>
          Think you know a voice?
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28, textAlign: "left" }}>
          {steps.map(({ num, icon, text }) => (
            <div key={num} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", background: "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "var(--navy)", flexShrink: 0,
              }}>
                {num}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}>
                {icon} {text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ color: "var(--navy)", opacity: 0.4, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
          Lowest time wins. Good luck.
        </div>
        <button
          onClick={onStart}
          style={{
            background: "var(--navy)", color: "white", border: "none",
            borderRadius: 50, padding: "14px 40px",
            fontFamily: "'Fredoka One', cursive", fontSize: 18,
            cursor: "pointer", boxShadow: "0 6px 0 rgba(0,0,0,0.3)",
            letterSpacing: "0.5px",
          }}
        >
          {"Let's Play \u2192"}
        </button>
      </div>
    </div>
  );
}
