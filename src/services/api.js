// All AI calls go through the Base44 backend proxy — no API keys in the app
const PROXY_URL = 'https://doris-a549f1ef.base44.app/functions/aiProxy';

// ── Chat (Groq) ────────────────────────────────────────────────────────────────
export async function chatWithAI(messages) {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'chat', messages }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Chat API error');
  }
  return (await res.json()).reply;
}

// ── Vision — Parse recipe from image (Groq Llama 4) ───────────────────────────
export async function parseRecipeFromImageBase64(base64) {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'vision', imageBase64: base64 }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Vision API error');
  }
  const text = (await res.json()).text;
  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse recipe JSON');
  return JSON.parse(jsonMatch[0]);
}

// ── Parse recipe from text ────────────────────────────────────────────────────
export async function parseRecipeFromText(text) {
  const messages = [
    {
      role: 'system',
      content: `You are a recipe parser. Extract recipe info and return ONLY raw JSON (no markdown, no explanation):
{"title":"","description":"","prepTime":"","cookTime":"","servings":"","ingredients":["qty + ingredient"],"steps":["full step"]}`,
    },
    { role: 'user', content: text },
  ];
  const reply = await chatWithAI(messages);
  const jsonMatch = reply.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse recipe');
  return JSON.parse(jsonMatch[0]);
}

// ── TTS (ElevenLabs) ──────────────────────────────────────────────────────────
export async function textToSpeech(text, voiceId) {
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'tts', text, voiceId }),
  });
  if (!res.ok) throw new Error('TTS failed');
  // Return blob URL for expo-av
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
