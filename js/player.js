/**
 * player.js — курьер: физика, прыжок, анимация
 * Если загружен img/courier.png — рисуется он, иначе пиксельная графика кодом.
 */

import {
  GRAVITY,
  JUMP_FORCE,
  GROUND_Y,
  PLAYER_X,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_COLOR,
  SCOOTER_COLOR,
  HITBOX_PLAYER_SCALE,
  VW,
} from './config.js';
import { imgCourier, isCourierLoaded } from './assets.js';

const MAX_JUMPS = 2;
const SPIN_FRAMES = 22;  // за сколько кадров полный оборот при двойном прыжке

let y = GROUND_Y - PLAYER_HEIGHT;
let vy = 0;
let frame = 0;
let isOnGround = true;
let jumpsUsed = 0;
let spinStartFrame = -1;  // кадр начала оборота при втором прыжке

/**
 * Сброс позиции и скорости при старте игры.
 */
export function reset() {
  y = GROUND_Y - PLAYER_HEIGHT;
  vy = 0;
  frame = 0;
  isOnGround = true;
  jumpsUsed = 0;
  spinStartFrame = -1;
}

/**
 * Прыжок: на земле или двойной прыжок (макс 2 за раз в воздухе).
 * @returns {boolean} удалось ли прыгнуть
 */
export function jump() {
  if (isOnGround) jumpsUsed = 0;
  if (jumpsUsed >= MAX_JUMPS) return false;
  const impulse = jumpsUsed === 0 ? JUMP_FORCE : (JUMP_FORCE * 1.1);
  vy = impulse;
  jumpsUsed++;
  isOnGround = false;
  if (jumpsUsed === 2) spinStartFrame = frame;  // начать оборот при втором прыжке
  return true;
}

/**
 * Обновление физики (вызывается каждый кадр).
 */
export function update() {
  vy += GRAVITY;
  y += vy;
  if (y >= GROUND_Y - PLAYER_HEIGHT) {
    y = GROUND_Y - PLAYER_HEIGHT;
    vy = 0;
    isOnGround = true;
    jumpsUsed = 0;
    spinStartFrame = -1;
  }
  frame++;
}

/** Текущий угол поворота при обороте в воздухе (0 … 2*PI), иначе 0 */
function getSpinAngle() {
  if (spinStartFrame < 0) return 0;
  const elapsed = frame - spinStartFrame;
  if (elapsed >= SPIN_FRAMES) {
    spinStartFrame = -1;
    return 0;
  }
  return (elapsed / SPIN_FRAMES) * Math.PI * 2;
}

/**
 * Хитбокс игрока (на 25% меньше визуала).
 */
export function getHitbox() {
  const padW = PLAYER_WIDTH * (1 - HITBOX_PLAYER_SCALE) / 2;
  const padH = PLAYER_HEIGHT * (1 - HITBOX_PLAYER_SCALE) / 2;
  return {
    x: PLAYER_X + padW,
    y: y + padH,
    w: PLAYER_WIDTH * HITBOX_PLAYER_SCALE,
    h: PLAYER_HEIGHT * HITBOX_PLAYER_SCALE,
  };
}

/**
 * Текущая Y для отрисовки частиц смерти в позиции персонажа.
 */
export function getPosition() {
  return { x: PLAYER_X, y, w: PLAYER_WIDTH, h: PLAYER_HEIGHT };
}

/** Рисует спрайт курьера с верхним левым углом в (0, 0) — для поворота вокруг центра */
function drawSpriteAtOrigin(ctx) {
  if (isCourierLoaded() && imgCourier.naturalWidth) {
    ctx.drawImage(imgCourier, 0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    return;
  }
  const wheelFrame = Math.floor(frame / 8) % 2;
  const isJumping = !isOnGround;
  ctx.strokeStyle = SCOOTER_COLOR;
  ctx.fillStyle = SCOOTER_COLOR;
  ctx.lineWidth = 2;
  const deckY = PLAYER_HEIGHT - 8;
  ctx.fillRect(5, deckY, 30, 4);
  ctx.beginPath();
  ctx.moveTo(10, deckY);
  ctx.lineTo(12, deckY + 12);
  ctx.moveTo(28, deckY);
  ctx.lineTo(30, deckY + 12);
  ctx.stroke();
  const wheelY = deckY + 12;
  ctx.beginPath();
  ctx.arc(11, wheelY, 4, 0, Math.PI * 2);
  ctx.arc(29, wheelY, 4, 0, Math.PI * 2);
  if (wheelFrame === 1) {
    ctx.moveTo(9, wheelY);
    ctx.lineTo(13, wheelY);
    ctx.moveTo(27, wheelY);
    ctx.lineTo(31, wheelY);
  }
  ctx.stroke();
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(10, 4, 12, 12);
  ctx.fillRect(8, 16, 16, 20);
  ctx.fillStyle = '#333';
  ctx.fillRect(12, 8, 2, 2);
  ctx.fillRect(18, 8, 2, 2);
  if (isJumping) {
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(6, 34, 6, 14);
    ctx.fillRect(22, 34, 6, 14);
  } else {
    ctx.fillStyle = PLAYER_COLOR;
    const legOffset = (frame % 16 < 8) ? 4 : -2;
    ctx.fillRect(10 + legOffset, 36, 5, 12);
    ctx.fillRect(18 - legOffset, 36, 5, 12);
  }
}

/**
 * Отрисовка курьера на самокате (картинка img/courier.png или пиксельный стиль).
 * При двойном прыжке — полный оборот вокруг своей оси.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ center?: boolean }} opts — center: true для стартового экрана (по центру)
 */
export function draw(ctx, opts = {}) {
  const drawX = opts.center ? (VW / 2 - PLAYER_WIDTH / 2) : PLAYER_X;
  const spinAngle = getSpinAngle();

  ctx.save();

  if (spinAngle > 0) {
    const cx = drawX + PLAYER_WIDTH / 2;
    const cy = y + PLAYER_HEIGHT / 2;
    ctx.translate(cx, cy);
    ctx.rotate(spinAngle);
    ctx.translate(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT / 2);
    drawSpriteAtOrigin(ctx);
  } else {
    ctx.translate(drawX, y);
    drawSpriteAtOrigin(ctx);
  }

  ctx.restore();
}
