/**
 * background.js — облака, земля, камешки
 * Всё в виртуальных координатах 400×600.
 */

import { VW, VH, GROUND_Y, COLOR_BG, COLOR_GROUND, COLOR_CLOUD, COLOR_ROCK } from './config.js';

const CLOUD_COUNT = 4;
const clouds = [];
let speed = 3;

function initClouds() {
  for (let i = 0; i < CLOUD_COUNT; i++) {
    clouds.push({
      x: Math.random() * VW,
      y: 40 + Math.random() * 120,
      size: 12 + Math.random() * 8,
    });
  }
}

/**
 * Установить скорость (для движения облаков).
 */
export function setSpeed(s) {
  speed = s;
}

/**
 * Сброс позиций облаков.
 */
export function reset() {
  clouds.forEach((c, i) => {
    c.x = (i / CLOUD_COUNT) * VW + Math.random() * 80;
    c.y = 40 + Math.random() * 120;
    c.size = 12 + Math.random() * 8;
  });
}

/**
 * Обновление: облака плывут влево, за цикл возвращаются справа.
 */
export function update() {
  clouds.forEach((c) => {
    c.x -= speed * 0.3;
    if (c.x + c.size * 3 < 0) {
      c.x = VW + c.size * 2;
      c.y = 40 + Math.random() * 120;
    }
  });
}

/**
 * Отрисовка: фон, земля (линия + камешки), облака.
 * @param {CanvasRenderingContext2D} ctx
 */
export function draw(ctx) {
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, VW, VH);

  // Облака — пиксельные
  ctx.fillStyle = COLOR_CLOUD;
  clouds.forEach((c) => {
    const s = c.size;
    ctx.fillRect(c.x, c.y, s, s);
    ctx.fillRect(c.x + s * 0.6, c.y - s * 0.3, s * 0.8, s * 0.8);
    ctx.fillRect(c.x + s * 1.2, c.y, s * 0.7, s * 0.7);
  });

  // Земля — тонкая чёрная линия
  ctx.strokeStyle = COLOR_GROUND;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(VW, GROUND_Y);
  ctx.stroke();

  // Камешки — мелкие прямоугольники вдоль линии
  ctx.fillStyle = COLOR_ROCK;
  const rockBaseY = GROUND_Y + 2;
  for (let i = 0; i < 25; i++) {
    const px = (i * 17 + (i % 3) * 11) % (VW + 20) - 10;
    const py = rockBaseY + (i % 2) * 2;
    ctx.fillRect(px, py, 3, 2);
  }
}

if (clouds.length === 0) initClouds();
