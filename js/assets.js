/**
 * assets.js — загрузка картинок курьера и логотипа.
 * Пеший: img/courier_walk_1.png, img/courier_walk_2.png
 * Велосипед: img/courier.png
 * Логотип: img/logo.png
 */

const BASE = (() => {
  const p = window.location.pathname;
  const last = p.lastIndexOf('/');
  return last <= 0 ? '' : p.slice(0, last);
})();
const P = (BASE ? BASE + '/' : '/') + 'img/';

export const imgCourierWalk1 = new Image();
export const imgCourierWalk2 = new Image();
export const imgCourier = new Image();
export const imgLogo = new Image();

imgCourierWalk1.src = P + 'courier_walk_1.png';
imgCourierWalk2.src = P + 'courier_walk_2.png';
imgCourier.src = P + 'courier.png';
imgLogo.src = P + 'logo.png';

export function isCourierLoaded() {
  return imgCourier.complete && imgCourier.naturalWidth > 0;
}

export function isCourierWalkLoaded() {
  return imgCourierWalk1.complete && imgCourierWalk1.naturalWidth > 0 &&
         imgCourierWalk2.complete && imgCourierWalk2.naturalWidth > 0;
}

export function isLogoLoaded() {
  return imgLogo.complete && imgLogo.naturalWidth > 0;
}
