/**
 * input.js — тач-ввод, запрет зума/жестов, вибрация
 * touchstart на document = прыжок; Space/ArrowUp для ПК-отладки.
 */

let onJump = null;

/**
 * Установить коллбэк прыжка (вызывается из game.js).
 * @param {function} callback
 */
export function setOnJump(callback) {
  onJump = callback;
}

/**
 * Вибрация с проверкой поддержки.
 * @param {number} ms
 */
export function vibrate(ms) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(ms);
    } catch (e) {}
  }
}

/**
 * Запрет нежелательных жестов и подготовка body.
 */
function preventGestures() {
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
  document.addEventListener('touchstart', preventDefault, { passive: false });
  document.addEventListener('touchmove', preventDefault, { passive: false });
  document.addEventListener('contextmenu', preventDefault);
}

function preventDefault(e) {
  if (e.target.closest('button') || e.target.closest('#gameOverButtons')) return;
  e.preventDefault();
}

/**
 * Обработчик тапа/клавиши — прыжок.
 */
function handleJump(e) {
  if (e.type === 'keydown') {
    if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
    e.preventDefault();
  }
  if (e.type === 'touchstart' && e.target.closest && (e.target.closest('button') || e.target.closest('#gameOverButtons'))) return;
  if (onJump && typeof onJump === 'function') {
    onJump();
  }
}

/**
 * Инициализация ввода: тап по всему документу и клавиши для отладки.
 */
export function init() {
  preventGestures();
  document.addEventListener('touchstart', handleJump, { passive: true });
  document.addEventListener('keydown', handleJump);
}
