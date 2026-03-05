export default function Onboarding({ onStart }) {
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div style={{ fontSize: 56 }}>🎭</div>
        <div className="onboarding-title">Think you know a voice?</div>
        <div className="onboarding-steps">
          {[
            { icon: "🔊", text: "Tap any card to hear a mystery voice" },
            { icon: "🎯", text: "Pick the matching name from the panel" },
            { icon: "⚡", text: "Wrong guess = +10 seconds penalty" },
          ].map((step, i) => (
            <div key={i} className="onboarding-step">
              <div className="onboarding-step-num">{i + 1}</div>
              <span>{step.icon} {step.text}</span>
            </div>
          ))}
        </div>
        <div className="onboarding-subtext">Lowest time wins. Good luck. 🎧</div>
        <button className="play-btn" onClick={onStart}>Let's Play →</button>
      </div>
    </div>
  );
}
