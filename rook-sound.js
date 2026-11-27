// Kenney Impact Sounds 1.0, CC0, https://kenney.nl/assets/impact-sounds
const clips={move:new Audio('data:audio/mpeg;base64,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'),capture:new Audio('data:audio/mpeg;base64,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')};
clips.check = new Audio(new URL('./assets/audio/check-v329.mp3', import.meta.url).href);
for (const clip of Object.values(clips)) clip.preload = 'auto';

let enabled = true;
try { enabled = localStorage.getItem('rook-sound') !== 'off'; } catch {}

export function soundEnabled() {
  return enabled;
}

export function setSound(value) {
  enabled = Boolean(value);
  try { localStorage.setItem('rook-sound', enabled ? 'on' : 'off'); } catch {}
}

export function playSound(kind = 'move') {
  if (!enabled) return;
  const clip = kind === 'check' ? clips.check
    : kind === 'capture' || kind === 'mate' ? clips.capture
    : clips.move;
  try {
    clip.currentTime = 0;
    clip.play().catch(() => {});
  } catch {}
}

export function moveSound(move) {
  if (!move) return;
  if (/[+#]$/.test(move.san)) {
    playSound('check');
    return;
  }
  playSound(move.captured ? 'capture' : 'move');
}
