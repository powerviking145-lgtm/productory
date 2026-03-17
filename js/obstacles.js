/**
 * obstacles.js — препятствия: генерация, пул объектов
 * Пиксельные кактусы, чёрные, разной высоты. Пул — без new в цикле.
 */

import {
  VW,
  VH,
  GROUND_Y,
  OBSTACLE_GAP_MIN,
  OBSTACLE_GAP_MAX,
  OBSTACLE_HEIGHTS,
  OBSTACLE_SPAWN_X,
  COLOR_OBSTACLE,
  HITBOX_OBSTACLE_SCALE,
} from './config.js';

const POOL_SIZE = 15;
const pool = [];
let lastSpawnDistance = -500;  // дистанция в пикселях при последнем спавне
let speed = 3;

/** Инициализация пула препятствий */
function initPool() {
  for (let i = 0; i < POOL_SIZE; i++) {
    pool.push({
      x: -1000,
      height: 40,
      width: 20,
      active: false,
    });
  }
}

/** Взять неактивный объект из пула */
function getFromPool() {
  for (let i = 0; i < pool.length; i++) {
    if (!pool[i].active) return pool[i];
  }
  return null;
}

/**
 * Установить текущую скорость игры (для движения препятствий).
 * @param {number} s
 */
export function setSpeed(s) {
  speed = s;
}

/**
 * Сброс: деактивировать все, сбросить lastSpawnDistance.
 */
export function reset() {
  lastSpawnDistance = -500;
  pool.forEach((o) => (o.active = false));
}

/**
 * Генерация новых препятствий: по пройденной дистанции, промежуток 180–400 пикс.
 * @param {number} distance — пройденное расстояние в пикселях (суммарный сдвиг)
 */
export function spawn(distance) {
  if (distance - lastSpawnDistance < OBSTACLE_GAP_MIN) return;
  const gap = OBSTACLE_GAP_MIN + Math.random() * (OBSTACLE_GAP_MAX - OBSTACLE_GAP_MIN);
  if (distance - lastSpawnDistance < gap) return;
  const obj = getFromPool();
  if (!obj) return;
  obj.x = OBSTACLE_SPAWN_X;
  obj.height = OBSTACLE_HEIGHTS[Math.floor(Math.random() * OBSTACLE_HEIGHTS.length)];
  obj.width = 18;
  obj.active = true;
  lastSpawnDistance = distance;
}

/**
 * Обновление: сдвиг влево по speed, деактивация за левым краем.
 */
export function update() {
  pool.forEach((o) => {
    if (!o.active) return;
    o.x -= speed;
    if (o.x + o.width < 0) o.active = false;
  });
}

/**
 * Список активных препятствий с хитбоксами (на 10% меньше).
 */
export function getActive() {
  return pool.filter((o) => o.active).map((o) => {
    const padW = o.width * (1 - HITBOX_OBSTACLE_SCALE) / 2;
    const padH = o.height * (1 - HITBOX_OBSTACLE_SCALE) / 2;
    return {
      x: o.x + padW,
      y: GROUND_Y - o.height + padH,
      w: o.width * HITBOX_OBSTACLE_SCALE,
      h: o.height * HITBOX_OBSTACLE_SCALE,
      visual: { x: o.x, y: GROUND_Y - o.height, w: o.width, h: o.height },
    };
  });
}

/**
 * Отрисовка всех активных препятствий (пиксельные кактусы).
 * @param {CanvasRenderingContext2D} ctx
 */
export function draw(ctx) {
  ctx.fillStyle = COLOR_OBSTACLE;
  pool.forEach((o) => {
    if (!o.active) return;
    const baseY = GROUND_Y - o.height;
    // Основание — шире
    ctx.fillRect(o.x, baseY + o.height - 10, o.width, 10);
    // Столб кактуса
    const cx = o.x + o.width / 2 - 4;
    ctx.fillRect(cx, baseY, 8, o.height - 10);
    // "Иголки" — маленькие прямоугольники
    if (o.height >= 40) {
      ctx.fillRect(o.x + o.width - 4, baseY + o.height * 0.4, 6, 4);
      ctx.fillRect(o.x - 2, baseY + o.height * 0.6, 6, 4);
    }
  });
}

// Создаём пул при первом импорте
if (pool.length === 0) initPool();
