// pages/api/speak.js
// ─────────────────────────────────────────────────────────────────────────────
// Serverless proxy for Cartesia Sonic-3 TTS API.
//
// WHY: Browsers can't call Cartesia directly (CORS). This runs server-side.
// The API key stays in environment variables, never sent to the browser.
//
// FLOW: Browser → POST /api/speak → this fn → Cartesia → audio/mpeg → browser
//
// CARTESIA SONIC-3 API NOTES (hard-won):
//   - Use top-level "generation_config", NOT "voice.__experimental_controls"
//     (__experimental_controls is the old Sonic-2 API — different speed scale)
//   - speed: float 0.6–1.5 (1.0 = default)
//   - emotion: array of strings e.g. ["angry"]
//   - "neutral" is NOT a valid emotion — omit emotion key for default speech
//   - Omit generation_config entirely if nothing non-default to send
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, voiceId, emotion, speed } = req.body;

  if (!text || !voiceId) {
    return res.status(400).json({ error: "Missing required fields: text, voiceId" });
  }

  const apiKey = process.env.CARTESIA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "CARTESIA_API_KEY not configured on server" });
  }

  // Build generation_config only if we have non-default values.
  // "neutral" is not a valid emotion — omit it.
  const hasEmotion = emotion && emotion !== "neutral";
  const hasSpeed = speed && speed !== 1.0;
  const generationConfig = (hasEmotion || hasSpeed)
    ? {
        ...(hasSpeed ? { speed } : {}),
        ...(hasEmotion ? { emotion: emotion } : {}),  // string, NOT array
      }
    : null;

  const requestBody = {
    model_id: "sonic-3",
    transcript: text,
    voice: {
      mode: "id",
      id: voiceId,
    },
    output_format: {
      container: "mp3",
      encoding: "mp3",
      sample_rate: 44100,
    },
    language: "en",
    ...(generationConfig ? { generation_config: generationConfig } : {}),
  };

  try {
    const cartesiaRes = await fetch("https://api.cartesia.ai/tts/bytes", {
      method: "POST",
      headers: {
        "Cartesia-Version": "2024-06-10",
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!cartesiaRes.ok) {
      const errorText = await cartesiaRes.text();
      console.error("Cartesia API error:", cartesiaRes.status, errorText);
      return res.status(cartesiaRes.status).json({
        error: `Cartesia error: ${errorText}`,
      });
    }

    const audioBuffer = await cartesiaRes.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-cache");
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
}
