/**
 * renderer.js — масштабирование canvas, DPR, resize
 * Виртуальное разрешение 400×600, Retina через scale(dpr, dpr).
 */

import { VW, VH, CANVAS_HEIGHT_PERCENT } from './config.js';

let canvas = null;
let ctx = null;
let dpr = 1;
let scaleX = 1;
let scaleY = 1;

/**
 * Инициализация: получаем canvas и контекст, вешаем resize.
 */
export function init() {
  canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  if (!ctx) return;
  window.addEventListener('resize', resize);
  resize();
}

/**
 * Пересчёт размеров canvas.
 * 1. CSS: ширина 100%, высота по CANVAS_HEIGHT_PERCENT от окна — реальный размер.
 * 2. canvas.width/height = виртуальный × devicePixelRatio для чёткости.
 * 3. Внутри рисуем в координатах 400×600, scale(dpr) даёт Retina.
 */
export function resize() {
  if (!canvas || !ctx) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const container = canvas.parentElement;
  const rect = container ? container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
  const maxH = Math.floor(window.innerHeight * CANVAS_HEIGHT_PERCENT);
  let cssW = rect.width;
  let cssH = Math.min(rect.width * (VH / VW), maxH);
  scaleX = cssW / VW;
  scaleY = cssH / VH;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.floor(VW * dpr);
  canvas.height = Math.floor(VH * dpr);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

/**
 * Контекст 2D (всегда в виртуальных координатах после scale).
 */
export function getCtx() {
  return ctx;
}

/**
 * Canvas DOM-элемент.
 */
export function getCanvas() {
  return canvas;
}

/**
 * Коэффициенты масштаба CSS к виртуальным (если нужно).
 */
export function getScale() {
  return { scaleX, scaleY };
}

/**
 * Виртуальные размеры.
 */
export function getVirtualSize() {
  return { width: VW, height: VH };
}
