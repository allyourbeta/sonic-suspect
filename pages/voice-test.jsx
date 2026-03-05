// pages/voice-test.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dev tool: test all 16 voices without playing the game.
// Visit /voice-test on your local or deployed URL.
// Each button fires the real /api/speak endpoint.
// Status shows: idle → loading → playing → done / error
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import Head from "next/head";
import { CHARACTERS } from "../lib/characters";

const STATUS_COLOR = {
  idle:    "#E8DDD0",
  loading: "#F5C46A",
  playing: "#4ADE80",
  done:    "#D1FAE5",
  error:   "#FEE2E2",
};

const STATUS_LABEL = {
  idle:    "▶ Play",
  loading: "⏳ Loading…",
  playing: "🔊 Playing",
  done:    "✓ Done",
  error:   "✗ Error",
};

export default function VoiceTest() {
  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(CHARACTERS.map(c => [c.id, "idle"]))
  );
  const [errors, setErrors] = useState({});
  const audioRef = useRef(null);
  const [activeId, setActiveId] = useState(null);

  const setStatus = (id, status) =>
    setStatuses(s => ({ ...s, [id]: status }));

  const playCharacter = async (character) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    if (activeId) setStatus(activeId, "done");

    setActiveId(character.id);
    setStatus(character.id, "loading");
    setErrors(e => ({ ...e, [character.id]: null }));

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text:    character.phrases[0],
          voiceId: character.voiceId,
          emotion: character.emotion,
          speed:   character.speed,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      setStatus(character.id, "playing");
      audio.play();
      audio.onended = () => {
        setStatus(character.id, "done");
        setActiveId(null);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setStatus(character.id, "error");
        setErrors(e => ({ ...e, [character.id]: "Audio playback failed" }));
        setActiveId(null);
      };
    } catch (err) {
      setStatus(character.id, "error");
      setErrors(e => ({ ...e, [character.id]: err.message }));
      setActiveId(null);
    }
  };

  const playAll = async () => {
    for (const c of CHARACTERS) {
      await new Promise(resolve => {
        const doPlay = async () => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          setStatus(c.id, "loading");
          try {
            const res = await fetch("/api/speak", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: c.phrases[0], voiceId: c.voiceId, emotion: c.emotion, speed: c.speed }),
            });
            if (!res.ok) throw new Error(res.statusText);
            const url = URL.createObjectURL(await res.blob());
            const audio = new Audio(url);
            audioRef.current = audio;
            setStatus(c.id, "playing");
            setActiveId(c.id);
            audio.play();
            audio.onended = () => { setStatus(c.id, "done"); URL.revokeObjectURL(url); resolve(); };
            audio.onerror = () => { setStatus(c.id, "error"); resolve(); };
          } catch (err) {
            setStatus(c.id, "error");
            setErrors(e => ({ ...e, [c.id]: err.message }));
            resolve();
          }
        };
        doPlay();
      });
    }
    setActiveId(null);
  };

  return (
    <>
      <Head><title>Voice Test — Sonic Suspect</title></Head>
      <div style={{ fontFamily: "'Figtree', sans-serif", background: "#F5F0E8", minHeight: "100vh", padding: "32px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: "#18113A" }}>🎧 Voice Test Panel</h1>
              <p style={{ fontSize: 13, color: "rgba(24,17,58,0.45)", fontWeight: 600, marginTop: 4 }}>
                Click any character to hear their voice. Tests the live /api/speak endpoint.
              </p>
            </div>
            <button
              onClick={playAll}
              style={{ background: "#18113A", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 0 rgba(0,0,0,0.3)" }}
            >
              ▶▶ Play All In Order
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 12 }}>
            {CHARACTERS.map(c => {
              const status = statuses[c.id];
              const error  = errors[c.id];
              return (
                <div
                  key={c.id}
                  style={{
                    background: "#fff",
                    border: `2px solid ${status === "playing" ? "#4ADE80" : status === "error" ? "#FCA5A5" : "#E8DDD0"}`,
                    borderLeft: `5px solid ${STATUS_COLOR[status]}`,
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex", alignItems: "flex-start", gap: 14,
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* Emoji + ID */}
                  <div style={{ fontSize: 28, lineHeight: 1, paddingTop: 2 }}>{c.emoji}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#18113A" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(24,17,58,0.4)", fontWeight: 600, marginTop: 2, marginBottom: 6 }}>
                      {c.emotion ?? "no emotion"} · speed {c.speed ?? 1.0}
                    </div>
                    <div style={{ fontSize: 12, color: "#6B5E4E", fontWeight: 600, fontStyle: "italic", lineHeight: 1.4, marginBottom: error ? 6 : 0 }}>
                      "{c.phrases[0]}"
                    </div>
                    {error && (
                      <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, marginTop: 6, background: "#FEE2E2", padding: "4px 8px", borderRadius: 6 }}>
                        ⚠ {error}
                      </div>
                    )}
                  </div>

                  {/* Play button */}
                  <button
                    onClick={() => playCharacter(c)}
                    disabled={status === "loading"}
                    style={{
                      background: STATUS_COLOR[status],
                      border: "none", borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 12, fontWeight: 800,
                      cursor: status === "loading" ? "wait" : "pointer",
                      whiteSpace: "nowrap", flexShrink: 0,
                      color: status === "playing" ? "#166534" : "#18113A",
                      transition: "background 0.2s",
                      minWidth: 90,
                    }}
                  >
                    {STATUS_LABEL[status]}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 28, padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1.5px solid #E8DDD0" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(24,17,58,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Valid Cartesia Emotions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["angry","outraged","contempt","disgusted","frustrated","sad","dejected","scared","surprised","happy","excited","euphoric","elated","enthusiastic","triumphant","content","serene","bored","confused"].map(e => (
                <span key={e} style={{ background: "#F5F0E8", border: "1.5px solid #E8DDD0", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#18113A" }}>{e}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
