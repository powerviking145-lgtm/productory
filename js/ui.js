/**
 * ui.js — DOM-кнопки game over, статус API
 * Кнопки "Забрать N ⭐" и "Ещё раз" под canvas.
 */

const btnClaim = document.getElementById('btnClaim');
const container = document.getElementById('gameOverButtons');

/**
 * Показать блок кнопок (с задержкой и slide-up по правилам).
 */
export function showButtons() {
  if (!container) return;
  container.classList.remove('hidden');
  container.style.opacity = '0';
  container.style.transform = 'translateY(20px)';
  container.style.transition = 'opacity 0.3s, transform 0.3s';
  requestAnimationFrame(() => {
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  });
}

/**
 * Скрыть блок кнопок.
 */
export function hideButtons() {
  if (!container) return;
  container.classList.add('hidden');
  container.style.transition = '';
  container.style.opacity = '';
  container.style.transform = '';
}

/**
 * Установить текст кнопки "Забрать" и сбросить состояние.
 * @param {string} text — например "Забрать 25 ⭐"
 */
export function setClaimText(text) {
  if (!btnClaim) return;
  btnClaim.textContent = text;
  btnClaim.disabled = false;
  btnClaim.classList.remove('success', 'error');
}

/**
 * Состояние: отправка.
 */
export function setClaimSending() {
  if (!btnClaim) return;
  btnClaim.textContent = 'Отправка...';
  btnClaim.disabled = true;
}

/**
 * Состояние: успех.
 */
export function setClaimSuccess() {
  if (!btnClaim) return;
  btnClaim.textContent = 'Баллы начислены! ✓';
  btnClaim.disabled = true;
  btnClaim.classList.add('success');
  btnClaim.classList.remove('error');
}

/**
 * Состояние: ошибка (можно повторить).
 */
export function setClaimError() {
  if (!btnClaim) return;
  btnClaim.textContent = 'Ошибка. Повторить?';
  btnClaim.disabled = false;
  btnClaim.classList.add('error');
  btnClaim.classList.remove('success');
}

function runClaim(handlers) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
  if (handlers.onClaim) handlers.onClaim();
}

function runRestart(handlers) {
  if (handlers.onRestart) handlers.onRestart();
}

/**
 * Подписка на нажатия кнопок (click + touchend для мобильных).
 * @param {{ onClaim: function, onRestart: function }} handlers
 */
export function bindButtons(handlers) {
  const rest = document.getElementById('btnRestart');
  if (btnClaim) {
    btnClaim.addEventListener('click', () => runClaim(handlers));
    btnClaim.addEventListener('touchend', (e) => {
      e.preventDefault();
      runClaim(handlers);
    }, { passive: false });
  }
  if (rest) {
    rest.addEventListener('click', () => runRestart(handlers));
    rest.addEventListener('touchend', (e) => {
      e.preventDefault();
      runRestart(handlers);
    }, { passive: false });
  }
}
