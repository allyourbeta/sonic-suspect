// lib/characters.js
// ─────────────────────────────────────────────────────────────────────────────
// 16 character definitions for Sonic Suspect.
//
// Each character has:
//   id        - unique 1-16
//   name      - display name shown in name panel
//   emoji     - fallback if DiceBear avatar fails to load
//   color     - accent color (used for revealed card border)
//   voiceId   - Cartesia voice UUID
//   emotion   - Cartesia emotion string, or null for default
//               Valid: angry, excited, sad, scared, content, surprise, etc.
//               Do NOT use "neutral" — omit (null) for default speech
//   speed     - float 0.6–1.5, or null for default (1.0)
//   phrases   - 4 phrases, cycled on repeat clicks
//
// ─────────────────────────────────────────────────────────────────────────────

export const CHARACTERS = [
  {
    id: 1,
    name: "The Gruff Pirate",
    emoji: "🏴‍☠️",
    color: "#FF6B2B",
    voiceId: "23e9e50a-4ea2-447b-b589-df90dbb848a2", // Dallas - Fireside Friend
    emotion: "outraged",
    speed: 0.85,
    phrases: [
      "Billions of blue blistering barnacles!",
    ],
  },
  {
    id: 2,
    name: "The Nervous Intern",
    emoji: "😰",
    color: "#2EC4B6",
    voiceId: "f6141af3-5f94-418c-80ed-a45d450e7e2e", // Priya - Trusted Operator
    emotion: "scared",
    speed: 1.15,
    phrases: [
      "Oh gosh— did I reply-all to the whole company?.",
    ],
  },
  {
    id: 3,
    name: "The Bored Professor",
    emoji: "🎓",
    color: "#7B2FBE",
    voiceId: "4f7f1324-1853-48a6-b294-4e78e8036a83", // Casper - Gentle Narrator
    emotion: null,
    speed: 0.8,
    phrases: [
      "This will be on the exam. Or maybe it won't.",
    ],
  },
  {
    id: 4,
    name: "The Hyperactive Kid",
    emoji: "🤸",
    color: "#FFD000",
    voiceId: "f31cc6a7-c1e8-4764-980c-60a361443dd1", // Olivia - Sunny Woman
    emotion: "excited",
    speed: 1.4,
    phrases: [
      "Are we there yet? Are we there yet?",
    ],
  },
  {
    id: 5,
    name: "The Evil Villain",
    emoji: "🦹",
    color: "#1A1A40",
    voiceId: "34d923aa-c3b5-4f21-aac7-2c1f12730d4b", // Griffin - Excited Narrator
    emotion: "contempt",
    speed: 0.9,
    phrases: [
      "I find your lack of faith disturbing.",
    ],
  },
  {
    id: 6,
    name: "The Yoga Instructor",
    emoji: "🧘",
    color: "#06D6A0",
    voiceId: "7d7d769c-5ab1-4dd5-bb17-ec8d4b69d03d", // Eleanor - Composed Clarifier
    emotion: "serene",
    speed: 0.75,
    phrases: [
      "Breathe in... hold it... and release..",
    ],
  },
  {
    id: 7,
    name: "The Sports Commentator",
    emoji: "🎙️",
    color: "#FF4D9E",
    voiceId: "fbf7d2ec-ebea-49f2-8889-a482b9b0a7ed", // Wade 2.0 - Southern Soul
    emotion: "euphoric",
    speed: 1.3,
    phrases: [
      "Down goes Frazier! Down goes Frazier!",
    ],
  },
  {
    id: 8,
    name: "The Sad Clown",
    emoji: "🤡",
    color: "#FF9F1C",
    voiceId: "2f251ac3-89a9-4a77-a452-704b474ccd01", // Lucy - Capable Coordinator
    emotion: "dejected",
    speed: 0.75,
    phrases: [
      "Nobody laughed at my balloon animals today.",
    ],
  },
  {
    id: 9,
    name: "The Conspiracy Theorist",
    emoji: "🕵️",
    color: "#2EC4B6",
    voiceId: "1cb5b8bc-77c9-4e7c-a251-da02348e2727", // Sean - Steady Companion
    emotion: "frustrated",
    speed: 1.1,
    phrases: [
      "If the earth is round, why did Hillary put pineapples on her pizza?",
    ],
  },
  {
    id: 10,
    name: "The Medieval Knight",
    emoji: "⚔️",
    color: "#7B2FBE",
    voiceId: "41f3c367-e0a8-4a85-89e0-c27bae9c9b6d", // Liam - Guy Next Door
    emotion: null,
    speed: 0.85,
    phrases: [
      "It's only a flesh wound.",
    ],
  },
  {
    id: 11,
    name: "The Polite Canadian",
    emoji: "🍁",
    color: "#FF4D9E",
    voiceId: "0a9a5903-0a30-4d2e-b6b6-891f73d4b4e0", // Sabrina - Casual Ally
    emotion: "content",
    speed: 1.0,
    phrases: [
      "Oh gosh, I'm so sorry - I think I accidentally ran over your new Macbook Neo.",
    ],
  },
  {
    id: 12,
    name: "The Infomercial Host",
    emoji: "📺",
    color: "#FFD000",
    voiceId: "a924b0e6-9253-4711-8fc3-5cb8e0188c94", // Noah - Calming Presence
    emotion: "elated",
    speed: 1.2,
    phrases: [
      "But WAIT — there's more. Heads we win tails you lose!",
    ],
  },
  {
    id: 13,
    name: "The Sleepy Grandpa",
    emoji: "👴",
    color: "#06D6A0",
    voiceId: "c99d36f3-5ffd-4253-803a-535c1bc9c306", // Griffin - Narrator
    emotion: null,
    speed: 0.65,
    phrases: [
      "Back in my day... we walked barefoot and uphill, both ways.",
    ],
  },
  {
    id: 14,
    name: "The Malfunctioning Robot",
    emoji: "🤖",
    color: "#2EC4B6",
    voiceId: "fb26447f-308b-471e-8b00-8e9f04284eb5", // Thistle - Troublemaker
    emotion: "angry",
    speed: 0.95,
    phrases: [
      "GREETINGS HUMAN. All systems normal. DISREGARD THE SMOKE.",
    ],
  },
  {
    id: 15,
    name: "The Method Actor",
    emoji: "🎭",
    color: "#FF9F1C",
    voiceId: "71a7ad14-091c-4e8e-a314-022ece01c121", // Charlotte - Heiress (theatrical intensity)
    emotion: "triumphant",
    speed: 1.0,
    phrases: [
      "I lived on soylent green to prepare for this role.",
    ],
  },
  {
    id: 16,
    name: "The Motivational Coach",
    emoji: "💪",
    color: "#FF4D9E",
    voiceId: "6fbca103-0f7f-4e49-97ed-49a53b4f3534", // Maxine - Relaxed Energy
    emotion: "enthusiastic",
    speed: 1.2,
    phrases: [
      "Give me 100 burpees RIGHT NOW!",
    ],
  },
];
