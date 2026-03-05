# CLAUDE.md — Sonic Suspect

## What this project is
A voice memory game built to demonstrate Cartesia Sonic-3's TTS capabilities.
Built as a job application demo for a PM role at Cartesia.

The game: 16 face-down cards, each hiding a character. Click a card → hear a
Cartesia-generated voice clip. Click the matching name from a side panel.
Correct = card flips permanently. Wrong = 10-second score penalty.
Win when all 16 matched. Score = elapsed time + (wrong guesses × 10s).

**Live at:** https://sonic-suspect.vercel.app (once deployed)

---

## Stack
- **Next.js 14** (Pages Router — not App Router)
- **Vercel** for hosting + serverless functions
- **Cartesia Sonic-3** for TTS audio
- No database yet (Supabase leaderboard is Phase 5)
- No external CSS frameworks — all inline styles

---

## File structure
```
sonic-suspect/
├── pages/
│   ├── _app.js          # imports globals.css only
│   ├── index.jsx        # entire game UI (React)
│   └── api/
│       └── speak.js     # Cartesia proxy (serverless function)
├── lib/
│   └── characters.js    # 16 character definitions (game data)
├── styles/
│   └── globals.css      # CSS animations + base reset only
├── .env.local           # CARTESIA_API_KEY (never commit)
├── .env.example         # template
├── next.config.js
└── package.json
```

---

## Cartesia API — confirmed working spec

### Endpoint
```
POST https://api.cartesia.ai/tts/bytes
Headers:
  Cartesia-Version: 2024-06-10
  X-API-Key: <CARTESIA_API_KEY>
  Content-Type: application/json
```

### Request body
```json
{
  "model_id": "sonic-3",
  "transcript": "text to speak",
  "voice": {
    "mode": "id",
    "id": "<voice_uuid>"
  },
  "generation_config": {
    "speed": 1.0,
    "emotion": ["angry"]
  },
  "output_format": {
    "container": "mp3",
    "encoding": "mp3",
    "sample_rate": 44100
  },
  "language": "en"
}
```

### CRITICAL: Two different APIs — do NOT mix them up

**Sonic-3 (current):** uses top-level `generation_config`
- `speed`: float, range **0.6 to 1.5** (1.0 = default)
- `emotion`: **plain string** e.g. `"angry"` (NOT an array — generation_config differs from experimental_controls)
- Valid emotions: `angry`, `excited`, `sad`, `scared`, `content`
  plus 60+ others. Do NOT use `"neutral"` — omit emotion entirely for default.

**Sonic-2 / older (DO NOT USE):** used `voice.__experimental_controls`
- Different speed scale: -1.0 to 1.0
- We are NOT using this. Ignore any docs or examples that reference
  `__experimental_controls`.

### Omit generation_config when not needed
Only include `generation_config` if at least one value is non-default:
```js
// Good — omit entirely for plain speech
{ "model_id": "sonic-3", "voice": { "mode": "id", "id": "..." }, ... }

// Good — only include what's non-default
{ "generation_config": { "speed": 1.3, "emotion": "excited" } }

// BAD — will error
{ "generation_config": { "emotion": ["neutral"] } }
{ "voice": { "__experimental_controls": { "emotion": ["angry"] } } }
```

### Confirmed working voice IDs
- `c45bc5ec-dc68-4feb-8829-6ac6b9677fbd` — deep male ("Barbarian")
- `f786b574-daa5-4673-aa0c-cbe3e8534c02` — clear female ("Katie")

More voices: https://play.cartesia.ai/voices (browse and copy IDs)

---

## The proxy function (pages/api/speak.js)

The browser cannot call Cartesia directly (CORS). This serverless function
is the bridge:

```
Browser → POST /api/speak { text, voiceId, emotion, speed }
        → pages/api/speak.js
        → POST api.cartesia.ai/tts/bytes
        → returns audio/mpeg blob
```

The API key lives in `process.env.CARTESIA_API_KEY` — never in the browser.

---

## Character data (lib/characters.js)

Each character has:
```js
{
  id: 1,                    // unique, 1-16
  name: "The Gruff Pirate", // display name
  emoji: "🏴‍☠️",           // shown on revealed card
  color: "#8B1A1A",         // accent color for revealed card
  voiceId: "uuid...",       // Cartesia voice ID
  emotion: "angry",         // Cartesia emotion (or null for default)
  speed: 0.85,              // 0.6-1.5, or null for default (1.0)
  phrases: [...],           // 4 phrases, cycled on repeat clicks
}
```

---

## Game state (pages/index.jsx)

Key state variables:
- `cards` — shuffled array of characters (shuffle deferred to useEffect to avoid hydration error)
- `revealed` — `{ [charId]: true }` for matched cards
- `matched` — `{ [charId]: true }` for correctly guessed cards
- `selectedCard` — charId of card clicked (awaiting name selection)
- `selectedName` — charId from name panel (awaiting card selection)
- `playing` — charId currently generating/playing audio
- `elapsed`, `wrongGuesses` — for scoring
- `started`, `finished` — game lifecycle

Match check: when both `selectedCard` and `selectedName` are set,
a `useEffect` compares them. If equal → correct. Clear both after check.

---

## Known bugs fixed (do not reintroduce)

1. **Hydration error** — cards must NOT shuffle in `useState` initializer.
   Use `useState(CHARACTERS)` then `useEffect(() => setCards(shuffle(...)), [])`.

2. **Cartesia emotion format** — emotion is an array `["angry"]` not a string.
   For Sonic-3, use `generation_config` not `__experimental_controls`.

3. **CORS** — never call Cartesia from the browser directly.
   Always proxy through `/api/speak`.

---

## Running locally

```bash
npm install
cp .env.example .env.local
# add CARTESIA_API_KEY to .env.local
npm run dev
# → http://localhost:3000
```

## Deploying to Vercel

```bash
vercel deploy --prod
vercel env add CARTESIA_API_KEY   # paste key, select all environments
vercel deploy --prod              # redeploy with key active
```

---

## What "done" looks like (current phase)

- [ ] All 16 cards play audio without API errors
- [ ] Each character sounds meaningfully distinct
- [ ] Cards flip correctly on match
- [ ] Score (time + penalty) works correctly
- [ ] Win screen shows on completion
- [ ] Deploys to Vercel without errors
- [ ] No console errors in production

## Next phases (not started)
- **Phase 5:** Supabase leaderboard — save score + player name, show top 10
- **Phase 6:** Polish — share button, mobile layout, footer with Cartesia link
