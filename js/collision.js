/**
 * collision.js — AABB пересечение прямоугольников
 * Хитбоксы передаются как { x, y, w, h }.
 */

/**
 * Проверка пересечения двух прямоугольников (AABB).
 * @param {{ x: number, y: number, w: number, h: number }} a
 * @param {{ x: number, y: number, w: number, h: number }} b
 * @returns {boolean}
 */
export function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
