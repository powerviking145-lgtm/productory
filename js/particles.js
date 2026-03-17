/**
 * particles.js — частицы сбора бонуса и смерти (пул, макс 20)
 */

import { PARTICLE_MAX, DEATH_PARTICLE_COUNT, BONUS_PARTICLE_COUNT } from './config.js';

const pool = [];
let used = 0;

function initPool() {
  for (let i = 0; i < PARTICLE_MAX; i++) {
    pool.push({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 30,
      size: 4,
      color: '#333',
      active: false,
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
 * Спавн частиц смерти курьера (15–20 цветных квадратиков).
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 */
export function spawnDeath(x, y, w, h) {
  const count = Math.min(DEATH_PARTICLE_COUNT, PARTICLE_MAX - used);
  const colors = ['#00BFFF', '#333', '#00BFFF', '#1E90FF', '#333'];
  const cx = x + w / 2;
  const cy = y + h / 2;
  for (let i = 0; i < count; i++) {
    const p = getFromPool();
    if (!p) break;
    p.x = cx + (Math.random() - 0.5) * w;
    p.y = cy + (Math.random() - 0.5) * h;
    p.vx = (Math.random() - 0.5) * 14;
    p.vy = (Math.random() - 0.5) * 14 - 4;
    p.life = 0;
    p.maxLife = (25 + Math.floor(Math.random() * 15)) / 60;
    p.size = 3 + Math.floor(Math.random() * 3);
    p.color = colors[Math.floor(Math.random() * colors.length)];
    p.active = true;
    used++;
  }
}

/**
 * Спавн частиц при сборе бонуса (жёлтая вспышка).
 * @param {number} x
 * @param {number} y
 */
export function spawnBonus(x, y) {
  const count = Math.min(BONUS_PARTICLE_COUNT, PARTICLE_MAX - used);
  const cx = x + 10;
  const cy = y + 10;
  for (let i = 0; i < count; i++) {
    const p = getFromPool();
    if (!p) break;
    p.x = cx;
    p.y = cy;
    const angle = (Math.PI * 2 * i) / count + Math.random();
    const speed = 2 + Math.random() * 4;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed - 2;
    p.life = 0;
    p.maxLife = 20 / 60;
    p.size = 3;
    p.color = '#FFD700';
    p.active = true;
    used++;
  }
}

/**
 * Обновление частиц (delta time: life в секундах).
 * @param {number} dt — множитель, 1 при 60 FPS
 */
export function update(dt = 1) {
  const deltaSec = dt / 60;
  pool.forEach((p) => {
    if (!p.active) return;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 0.3 * dt;
    p.life += deltaSec;
    if (p.life >= p.maxLife) {
      p.active = false;
      used--;
    }
  });
}

/**
 * Отрисовка частиц.
 * @param {CanvasRenderingContext2D} ctx
 */
export function draw(ctx) {
  pool.forEach((p) => {
    if (!p.active) return;
    const alpha = 1 - p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.globalAlpha = 1;
  });
}

if (pool.length === 0) initPool();
