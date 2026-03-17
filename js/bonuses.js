/**
 * bonuses.js — сбор логотипов компании: генерация, сбор, лимит 50 за игру
 * Если загружен img/logo.png — рисуется он, иначе пиксельные иконки.
 */

import {
  VW,
  GROUND_Y,
  BONUS_SPAWN_CHANCE,
  BONUS_MIN_Y_OFFSET,
  BONUS_MAX_Y_OFFSET,
  BONUS_MIN_DISTANCE,
  BONUS_MAX_ON_SCREEN,
  BONUS_MAX_PER_GAME,
  BONUS_SIZE,
  BONUS_BOB_AMPLITUDE,
  BONUS_BOB_SPEED,
  BONUS_TYPES,
} from './config.js';
import { imgLogo, isLogoLoaded } from './assets.js';

const POOL_SIZE = 5;
const pool = [];
let lastSpawnX = -200;
let totalCollected = 0;
let totalSpawned = 0;
let speed = 3;
let gameDistance = 0;

function initPool() {
  for (let i = 0; i < POOL_SIZE; i++) {
    pool.push({
      x: -500,
      baseY: 0,
      type: 0,
      active: false,
      bobPhase: Math.random() * Math.PI * 2,
    });
  }
}

function getFromPool() {
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].active) return pool[i];
  }
  return null;
}

/**
 * Установить текущую скорость и пройденную дистанцию (пиксели).
 */
export function setSpeed(s) {
  speed = s;
}

export function setGameDistance(d) {
  gameDistance = d;
}

/**
 * Сброс при новой игре.
 */
export function reset() {
  lastSpawnX = -200;
  totalCollected = 0;
  totalSpawned = 0;
  pool.forEach((b) => (b.active = false));
}

/**
 * Сколько бонусов собрано за игру.
 */
export function getCollectedCount() {
  return totalCollected;
}

/**
 * Спавн бонуса: шанс 1.2%, не ближе 100px от последнего, макс 3 на экране, макс 50 за игру.
 */
export function trySpawn() {
  if (totalSpawned >= BONUS_MAX_PER_GAME) return;
  const activeCount = pool.filter((b) => b.active).length;
  if (activeCount >= BONUS_MAX_ON_SCREEN) return;
  if (gameDistance - lastSpawnX < BONUS_MIN_DISTANCE && lastSpawnX > 0) return;
  if (Math.random() >= BONUS_SPAWN_CHANCE) return;

  const obj = getFromPool();
  if (!obj) return;

  obj.x = VW + BONUS_SIZE;
  const offset = BONUS_MIN_Y_OFFSET + Math.random() * (BONUS_MAX_Y_OFFSET - BONUS_MIN_Y_OFFSET);
  obj.baseY = GROUND_Y - offset - BONUS_SIZE;
  obj.type = Math.floor(Math.random() * BONUS_TYPES.length);
  obj.active = true;
  obj.bobPhase = Math.random() * Math.PI * 2;
  lastSpawnX = gameDistance;
  totalSpawned++;
}

/**
 * Обновление: движение влево, деактивация за экраном.
 */
export function update() {
  pool.forEach((b) => {
    if (!b.active) return;
    b.x -= speed;
    b.bobPhase += BONUS_BOB_SPEED;
    if (b.x + BONUS_SIZE < 0) b.active = false;
  });
}

/**
 * Список активных бонусов с хитбоксами (x, y с учётом bob).
 */
export function getActive() {
  return pool.filter((b) => b.active).map((b) => {
    return {
      x: b.x,
      y: b.baseY + BONUS_BOB_AMPLITUDE * Math.sin(b.bobPhase),
      w: BONUS_SIZE,
      h: BONUS_SIZE,
      typeIndex: b.type,
      points: BONUS_TYPES[b.type].points,
      ref: b,
    };
  });
}

/** Отметить бонус как собранный и вернуть очки */
export function collect(ref) {
  if (!ref || !ref.active) return 0;
  ref.active = false;
  totalCollected++;
  return BONUS_TYPES[ref.type].points;
}

/**
 * Отрисовка бонусов — логотип img/logo.png или пиксельные иконки 20×20.
 * @param {CanvasRenderingContext2D} ctx
 */
export function draw(ctx) {
  pool.forEach((b) => {
    if (!b.active) return;
    const y = b.baseY + BONUS_BOB_AMPLITUDE * Math.sin(b.bobPhase);
    if (isLogoLoaded() && imgLogo.naturalWidth) {
      ctx.drawImage(imgLogo, b.x, y, BONUS_SIZE, BONUS_SIZE);
      return;
    }
    const t = BONUS_TYPES[b.type];
    ctx.fillStyle = t.color;
    if (t.id === 'package') {
      ctx.fillRect(b.x + 4, y + 4, 12, 12);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x + 6, y + 2, 8, 6);
    } else if (t.id === 'pizza') {
      ctx.fillRect(b.x + 2, y + 2, 16, 16);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(b.x + 6, y + 6, 8, 8);
    } else if (t.id === 'burger') {
      ctx.fillRect(b.x + 2, y + 4, 16, 4);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(b.x + 2, y + 8, 16, 6);
      ctx.fillStyle = t.color;
      ctx.fillRect(b.x + 2, y + 14, 16, 4);
    } else if (t.id === 'star') {
      ctx.fillRect(b.x + 8, y + 2, 4, 16);
      ctx.fillRect(b.x + 2, y + 8, 16, 4);
      ctx.fillRect(b.x + 4, y + 4, 12, 12);
    } else {
      // diamond
      ctx.beginPath();
      ctx.moveTo(b.x + 10, y + 2);
      ctx.lineTo(b.x + 18, y + 10);
      ctx.lineTo(b.x + 10, y + 18);
      ctx.lineTo(b.x + 2, y + 10);
      ctx.closePath();
      ctx.fill();
    }
  });
}

if (pool.length === 0) initPool();
