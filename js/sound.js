/**
 * sound.js — Web Audio API: звук прыжка, сбора бонуса, удара
 * Без загрузок, генерация тонов кодом.
 */

let ctx = null;
let initialized = false;

function getContext() {
  if (ctx) return ctx;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    initialized = true;
    return ctx;
  } catch (e) {
    return null;
  }
}

/**
 * Короткий тон (частота, длительность, тип осциллятора).
 */
function beep(freq, duration, type = 'square') {
  const ac = getContext();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (e) {}
}

/**
 * Звук прыжка.
 */
export function playJump() {
  beep(400, 0.08, 'square');
  setTimeout(() => beep(500, 0.06, 'square'), 50);
}

/**
 * Звук сбора бонуса.
 */
export function playCollect() {
  beep(660, 0.1, 'square');
  setTimeout(() => beep(880, 0.08, 'square'), 80);
}

/**
 * Звук столкновения (удар).
 */
export function playHit() {
  beep(150, 0.15, 'sawtooth');
  setTimeout(() => beep(100, 0.2, 'sawtooth'), 100);
}
