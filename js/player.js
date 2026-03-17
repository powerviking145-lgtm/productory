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

let y = GROUND_Y - PLAYER_HEIGHT;
let vy = 0;
let frame = 0;
let isOnGround = true;
let jumpsUsed = 0;

/**
 * Сброс позиции и скорости при старте игры.
 */
export function reset() {
  y = GROUND_Y - PLAYER_HEIGHT;
  vy = 0;
  frame = 0;
  isOnGround = true;
  jumpsUsed = 0;
}

/**
 * Прыжок: на земле или двойной прыжок (макс 2 за раз в воздухе).
 * @returns {boolean} удалось ли прыгнуть
 */
export function jump() {
  if (isOnGround) jumpsUsed = 0;
  if (jumpsUsed >= MAX_JUMPS) return false;
  // Второй прыжок в воздухе делаем чуть сильнее, чтобы он был явно заметен
  const impulse = jumpsUsed === 0 ? JUMP_FORCE : (JUMP_FORCE * 1.1);
  vy = impulse;
  jumpsUsed++;
  isOnGround = false;
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
  }
  frame++;
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

/**
 * Отрисовка курьера на самокате (картинка img/courier.png или пиксельный стиль).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ center?: boolean }} opts — center: true для стартового экрана (по центру)
 */
export function draw(ctx, opts = {}) {
  const drawX = opts.center ? (VW / 2 - PLAYER_WIDTH / 2) : PLAYER_X;

  if (isCourierLoaded() && imgCourier.naturalWidth) {
    ctx.drawImage(imgCourier, drawX, y, PLAYER_WIDTH, PLAYER_HEIGHT);
    return;
  }

  const wheelFrame = Math.floor(frame / 8) % 2;
  const isJumping = !isOnGround;

  ctx.save();

  // Самокат (под ногами)
  ctx.strokeStyle = SCOOTER_COLOR;
  ctx.fillStyle = SCOOTER_COLOR;
  ctx.lineWidth = 2;
  const deckY = y + PLAYER_HEIGHT - 8;
  ctx.fillRect(drawX + 5, deckY, 30, 4);
  ctx.beginPath();
  ctx.moveTo(drawX + 10, deckY);
  ctx.lineTo(drawX + 12, deckY + 12);
  ctx.moveTo(drawX + 28, deckY);
  ctx.lineTo(drawX + 30, deckY + 12);
  ctx.stroke();
  // Колёса
  const wheelY = deckY + 12;
  ctx.beginPath();
  ctx.arc(drawX + 11, wheelY, 4, 0, Math.PI * 2);
  ctx.arc(drawX + 29, wheelY, 4, 0, Math.PI * 2);
  if (wheelFrame === 1) {
    ctx.moveTo(drawX + 11 - 2, wheelY);
    ctx.lineTo(drawX + 11 + 2, wheelY);
    ctx.moveTo(drawX + 29 - 2, wheelY);
    ctx.lineTo(drawX + 29 + 2, wheelY);
  }
  ctx.stroke();

  // Тело курьера — голубой прямоугольник (голова + торс)
  ctx.fillStyle = PLAYER_COLOR;
  const headSize = 12;
  ctx.fillRect(drawX + 10, y + 4, headSize, headSize);
  ctx.fillRect(drawX + 8, y + 16, 16, 20);

  // Глаза
  ctx.fillStyle = '#333';
  ctx.fillRect(drawX + 12, y + 8, 2, 2);
  ctx.fillRect(drawX + 18, y + 8, 2, 2);

  if (isJumping) {
    // Поджатые ноги в прыжке
    ctx.fillStyle = PLAYER_COLOR;
    ctx.fillRect(drawX + 6, y + 34, 6, 14);
    ctx.fillRect(drawX + 22, y + 34, 6, 14);
  } else {
    // Ноги при беге (по кадрам)
    ctx.fillStyle = PLAYER_COLOR;
    const legOffset = (frame % 16 < 8) ? 4 : -2;
    ctx.fillRect(drawX + 10 + legOffset, y + 36, 5, 12);
    ctx.fillRect(drawX + 18 - legOffset, y + 36, 5, 12);
  }

  ctx.restore();
}
