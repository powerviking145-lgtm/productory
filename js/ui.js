/**
 * ui.js — DOM-кнопки game over, статус API
 * Кнопки "Забрать N ⭐" и "Ещё раз" под canvas.
 */

const btnClaim = document.getElementById('btnClaim');
const btnClaimText = document.getElementById('btnClaimText');
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
 * Установить текст кнопки "Забрать N баллов" (N — награда за раунд).
 * @param {string} text — например "Забрать 7 баллов" или число для форматирования
 */
export function setClaimText(text) {
  const str = typeof text === 'number' ? 'Забрать ' + text + ' баллов' : text;
  if (btnClaimText) btnClaimText.textContent = str;
  else if (btnClaim) btnClaim.textContent = str;
  if (btnClaim) {
    btnClaim.disabled = false;
    btnClaim.classList.remove('success', 'error');
  }
}

/**
 * Состояние: отправка.
 */
export function setClaimSending() {
  if (btnClaimText) btnClaimText.textContent = 'Отправка...';
  else if (btnClaim) btnClaim.textContent = 'Отправка...';
  if (btnClaim) btnClaim.disabled = true;
}

/**
 * Состояние: успех.
 */
export function setClaimSuccess() {
  if (btnClaimText) btnClaimText.textContent = 'Баллы начислены! ✓';
  else if (btnClaim) btnClaim.textContent = 'Баллы начислены! ✓';
  if (btnClaim) {
    btnClaim.disabled = true;
    btnClaim.classList.add('success');
    btnClaim.classList.remove('error');
  }
}

/**
 * Состояние: ошибка (можно повторить).
 */
export function setClaimError() {
  if (btnClaimText) btnClaimText.textContent = 'Ошибка. Повторить?';
  else if (btnClaim) btnClaim.textContent = 'Ошибка. Повторить?';
  if (btnClaim) {
    btnClaim.disabled = false;
    btnClaim.classList.add('error');
    btnClaim.classList.remove('success');
  }
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
