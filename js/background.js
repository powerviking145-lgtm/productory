/**
 * background.js — облака, земля, камешки
 * Всё в виртуальных координатах 400×600.
 */

import { VW, VH, GROUND_Y, COLOR_BG, COLOR_GROUND, COLOR_CLOUD, COLOR_ROCK } from './config.js';

const CLOUD_COUNT = 4;
const clouds = [];
let speed = 3;

const DASH_LENGTH = 24;
const DASH_GAP = 20;
const ROCK_PERIOD = 80;

const CITY_TOP = 80;
const CITY_BASE = 400;
const ROAD_BAND_TOP = 420;

const COLOR_CITY = '#7a8a9a';
const COLOR_CITY_LIGHT = '#8a96a2';
const COLOR_CITY_DARK = '#6b7b8a';
const COLOR_CITY_WINDOW = '#5d6d7e';
const COLOR_ROAD_BAND = '#f0f0f0';
const COLOR_BACK_CITY = '#b0b8be';

const BUILDINGS = [
  { w: 38, h: 160, type: 'flat' },
  { w: 44, h: 200, type: 'roof' },
  { w: 32, h: 120, type: 'dome' },
  { w: 42, h: 180, type: 'trapezoid' },
  { w: 36, h: 140, type: 'flat' },
  { w: 40, h: 170, type: 'roof' },
  { w: 28, h: 130, type: 'tower' },
  { w: 48, h: 200, type: 'flat' },
  { w: 20, h: 180, type: 'chimney' },
  { w: 40, h: 160, type: 'antenna' },
];
const CELL_WIDTH = 100;
const BACK_PARALLAX = 0.45;
const BACK_SCALE = 0.58;

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
 * Обновление: облака плывут влево (delta time для 30/60 FPS).
 * @param {number} dt — множитель, 1 при 60 FPS
 */
export function update(dt = 1) {
  clouds.forEach((c) => {
    c.x -= speed * 0.3 * dt;
    if (c.x + c.size * 3 < 0) {
      c.x = VW + c.size * 2;
      c.y = 40 + Math.random() * 120;
    }
  });
}

function drawBuildingBody(ctx, b, color, windowColor, drawDetails) {
  const top = -b.h;
  ctx.fillStyle = color;
  if (b.type === 'flat') {
    ctx.fillRect(0, top, b.w, b.h);
  } else if (b.type === 'roof') {
    ctx.fillRect(0, top + 18, b.w, b.h - 18);
    ctx.beginPath();
    ctx.moveTo(0, top + 18);
    ctx.lineTo(b.w / 2, top);
    ctx.lineTo(b.w, top + 18);
    ctx.closePath();
    ctx.fill();
  } else if (b.type === 'dome') {
    ctx.fillRect(0, top + 20, b.w, b.h - 20);
    ctx.beginPath();
    ctx.arc(b.w / 2, top + 20, b.w / 2 + 2, Math.PI, 0);
    ctx.fill();
  } else if (b.type === 'trapezoid') {
    ctx.beginPath();
    ctx.moveTo(4, 0);
    ctx.lineTo(b.w - 4, 0);
    ctx.lineTo(b.w, top);
    ctx.lineTo(0, top);
    ctx.closePath();
    ctx.fill();
  } else if (b.type === 'tower') {
    ctx.fillRect(0, top + 14, b.w, b.h - 14);
    ctx.beginPath();
    ctx.moveTo(b.w / 2, top + 14);
    ctx.lineTo(b.w / 2 - 4, top);
    ctx.lineTo(b.w / 2 + 4, top);
    ctx.closePath();
    ctx.fill();
  } else if (b.type === 'chimney') {
    ctx.fillRect(4, top + 30, b.w - 8, b.h - 30);
    ctx.fillRect(2, top + 20, b.w - 4, 14);
  } else if (b.type === 'antenna') {
    ctx.fillRect(0, top + 20, b.w, b.h - 20);
    ctx.fillRect(b.w / 2 - 2, top, 4, 20);
  }
  if (!drawDetails) return;
  ctx.fillStyle = windowColor;
  ctx.fillRect(3, top + 8, 5, 8);
  ctx.fillRect(b.w - 10, top + 8, 5, 8);
  if (b.h > 100) {
    ctx.fillRect(3, top + 50, 5, 8);
    ctx.fillRect(b.w - 10, top + 50, 5, 8);
  }
}

function shadeForCell(cellIndex) {
  const r = (cellIndex % 3) - 1;
  return r === 0 ? COLOR_CITY : r === 1 ? COLOR_CITY_LIGHT : COLOR_CITY_DARK;
}

function drawBuilding(ctx, x, baseY, b, opts = {}) {
  const scale = opts.scale || 1;
  const color = opts.color || COLOR_CITY;
  const windowColor = opts.windowColor || COLOR_CITY_WINDOW;
  const drawDetails = opts.details !== false;
  ctx.save();
  ctx.translate(x, baseY);
  if (scale !== 1) ctx.scale(scale, scale);
  drawBuildingBody(ctx, b, color, windowColor, drawDetails && scale >= 0.8);
  ctx.restore();
}

/**
 * Отрисовка: фон, город (фиксированная сетка — без ряби), полоса перед дорогой, облака, земля, дорога.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} scroll — смещение дороги (totalDistance)
 */
export function draw(ctx, scroll = 0) {
  ctx.fillStyle = COLOR_BG;
  ctx.fillRect(0, 0, VW, VH);

  const scrollBack = scroll * BACK_PARALLAX;
  const firstCell = Math.floor(scrollBack / CELL_WIDTH) - 2;
  const lastCell = Math.ceil((scrollBack + VW / BACK_SCALE) / CELL_WIDTH) + 2;
  for (let cellIndex = firstCell; cellIndex <= lastCell; cellIndex++) {
    const screenX = cellIndex * CELL_WIDTH - scrollBack;
    const idx = ((cellIndex % BUILDINGS.length) + BUILDINGS.length) % BUILDINGS.length;
    const b = BUILDINGS[idx];
    drawBuilding(ctx, screenX, CITY_BASE, b, {
      scale: BACK_SCALE,
      color: COLOR_BACK_CITY,
      details: false,
    });
  }

  const firstCellF = Math.floor(scroll / CELL_WIDTH) - 2;
  const lastCellF = Math.ceil((scroll + VW) / CELL_WIDTH) + 2;
  for (let cellIndex = firstCellF; cellIndex <= lastCellF; cellIndex++) {
    const screenX = cellIndex * CELL_WIDTH - scroll;
    const idx = ((cellIndex % BUILDINGS.length) + BUILDINGS.length) % BUILDINGS.length;
    const b = BUILDINGS[idx];
    drawBuilding(ctx, screenX, CITY_BASE, b, {
      color: shadeForCell(cellIndex),
    });
  }

  ctx.fillStyle = COLOR_ROAD_BAND;
  ctx.fillRect(0, ROAD_BAND_TOP, VW, GROUND_Y - ROAD_BAND_TOP);

  ctx.fillStyle = COLOR_CLOUD;
  clouds.forEach((c) => {
    const s = c.size;
    ctx.fillRect(c.x, c.y, s, s);
    ctx.fillRect(c.x + s * 0.6, c.y - s * 0.3, s * 0.8, s * 0.8);
    ctx.fillRect(c.x + s * 1.2, c.y, s * 0.7, s * 0.7);
  });

  ctx.fillStyle = COLOR_GROUND;
  ctx.fillRect(0, GROUND_Y, VW, 2);

  const roadScroll = scroll % (DASH_LENGTH + DASH_GAP);
  ctx.strokeStyle = COLOR_GROUND;
  ctx.lineWidth = 2;
  for (let x = -roadScroll; x < VW + DASH_LENGTH + DASH_GAP; x += DASH_LENGTH + DASH_GAP) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y - 4);
    ctx.lineTo(x + DASH_LENGTH, GROUND_Y - 4);
    ctx.stroke();
  }

  ctx.fillStyle = COLOR_ROCK;
  const rockBaseY = GROUND_Y + 2;
  const rockOffset = scroll % ROCK_PERIOD;
  for (let i = 0; i < 30; i++) {
    const px = (i * 17 + (i % 3) * 11 - rockOffset + ROCK_PERIOD * 2) % (VW + ROCK_PERIOD) - 10;
    const py = rockBaseY + (i % 2) * 2;
    if (px >= -5 && px <= VW + 5) ctx.fillRect(px, py, 3, 2);
  }
}

if (clouds.length === 0) initClouds();
