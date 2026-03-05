// Test-only mock — returns a tiny valid MP3 instantly
export default function handler(req, res) {
  // 4-byte minimal MP3 header — browser accepts it, plays as silence
  const buf = Buffer.from('fffbe464', 'hex');
  res.setHeader('Content-Type', 'audio/mpeg');
  res.send(buf);
}
