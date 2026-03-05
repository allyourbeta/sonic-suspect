# 🎭 Sonic Suspect

A voice memory game powered by [Cartesia Sonic-3](https://cartesia.ai).

Match 16 mystery voices to their characters. Each wrong guess adds 10 seconds
to your score. Lowest time wins.

**Stack:** Next.js · Vercel · Cartesia Sonic-3

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Cartesia API key
```bash
cp .env.example .env.local
```
Then edit `.env.local` and replace `your_cartesia_api_key_here` with your key
from [play.cartesia.ai](https://play.cartesia.ai).

### 3. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### First deploy
```bash
vercel deploy --prod
```

### Add your API key to Vercel
```bash
vercel env add CARTESIA_API_KEY
```
Paste your Cartesia API key when prompted. Then redeploy:
```bash
vercel deploy --prod
```

That's it — your game is live at the URL Vercel gives you.

---

## How the proxy works

Browsers can't call the Cartesia API directly (CORS restriction).
`pages/api/speak.js` is a Next.js serverless function that:
1. Receives `{ text, voiceId, emotion, speed }` from the browser
2. Calls Cartesia server-to-server using the secret API key
3. Streams the audio back to the browser

Your API key never touches the browser.

---

## Customizing characters

Edit `lib/characters.js` to change voices, emotions, speed, or phrases.
Browse available voices at [play.cartesia.ai/voices](https://play.cartesia.ai/voices).

Emotion options: `neutral`, `angry`, `excited`, `content`, `sad`, `scared` (60+ total)
Speed range: `0.6` (very slow) → `1.5` (very fast)
