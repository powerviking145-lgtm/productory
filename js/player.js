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
import { imgCourier, imgCourierWalk1, imgCourierWalk2, isCourierLoaded, isCourierWalkLoaded } from './assets.js';

const METERS_BIKE = 300;

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
 * Обновление физики (delta time — одинаково при 30 и 60 FPS).
 * @param {number} dt — множитель, 1 при 60 FPS, ~2 при 30 FPS
 */
export function update(dt = 1) {
  vy += GRAVITY * dt;
  y += vy * dt;
  if (y >= GROUND_Y - PLAYER_HEIGHT) {
    y = GROUND_Y - PLAYER_HEIGHT;
    vy = 0;
    isOnGround = true;
    jumpsUsed = 0;
    spinStartFrame = -1;
  }
  frame += dt;
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

/** Рисует спрайт курьера с верхним левым углом в (0, 0). phase: 'walk' | 'bike' */
function drawSpriteAtOrigin(ctx, phase) {
  if (phase === 'walk' && isCourierWalkLoaded()) {
    const walkFrame = Math.floor(frame / 8) % 2;
    const img = walkFrame === 0 ? imgCourierWalk1 : imgCourierWalk2;
    ctx.drawImage(img, 0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    return;
  }
  if (phase === 'bike' && isCourierLoaded() && imgCourier.naturalWidth) {
    ctx.drawImage(imgCourier, 0, 0, PLAYER_WIDTH, PLAYER_HEIGHT);
    return;
  }
  const isBike = phase === 'bike';
  const wheelFrame = Math.floor(frame / 8) % 2;
  const isJumping = !isOnGround;
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(10, 4, 12, 12);
  ctx.fillRect(8, 16, 16, 20);
  ctx.fillStyle = '#333';
  ctx.fillRect(12, 8, 2, 2);
  ctx.fillRect(18, 8, 2, 2);
  if (isBike) {
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
  }
  ctx.fillStyle = PLAYER_COLOR;
  if (isJumping) {
    ctx.fillRect(6, 34, 6, 14);
    ctx.fillRect(22, 34, 6, 14);
  } else {
    const legOffset = (frame % 16 < 8) ? 4 : -2;
    ctx.fillRect(10 + legOffset, 36, 5, 12);
    ctx.fillRect(18 - legOffset, 36, 5, 12);
  }
}

/**
 * Отрисовка курьера: пеший (0–299 м) или на велосипеде (300+ м).
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ center?: boolean, meters?: number }} opts — center для старта, meters для фазы (>=300 = велосипед)
 */
export function draw(ctx, opts = {}) {
  const drawX = opts.center ? (VW / 2 - PLAYER_WIDTH / 2) : PLAYER_X;
  const meters = opts.meters != null ? opts.meters : 0;
  const phase = meters >= METERS_BIKE ? 'bike' : 'walk';
  const spinAngle = getSpinAngle();

  ctx.save();

  if (spinAngle > 0) {
    const cx = drawX + PLAYER_WIDTH / 2;
    const cy = y + PLAYER_HEIGHT / 2;
    ctx.translate(cx, cy);
    ctx.rotate(spinAngle);
    ctx.translate(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT / 2);
    drawSpriteAtOrigin(ctx, phase);
  } else {
    ctx.translate(drawX, y);
    drawSpriteAtOrigin(ctx, phase);
  }

  ctx.restore();
}
