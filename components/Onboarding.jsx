export default function Onboarding({ onStart }) {
  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <span className="onboarding-icon">🎧</span>
        <div className="onboarding-title">Think you know a voice?</div>
        <div className="onboarding-steps">
          {[
            "Tap a card to hear a mystery voice",
            "Pick the matching name from the list",
            "Wrong guess = +5 seconds penalty",
          ].map((text, i) => (
            <div key={i} className="onboarding-step">
              <div className="step-num">{i + 1}</div>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div className="onboarding-sub">Lowest time wins. Good luck.</div>
        <button className="play-btn" onClick={onStart}>Let's Play →</button>
      </div>
    </div>
  );
}
