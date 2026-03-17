/**
 * assets.js — загрузка картинок курьера и логотипа компании.
 * Путь от корня сайта: img/courier.png, img/logo.png
 * Если файлов нет — игра рисует пиксельную графику кодом.
 */

const BASE = (() => {
  const p = window.location.pathname;
  const last = p.lastIndexOf('/');
  return last <= 0 ? '' : p.slice(0, last);
})();
const COURIER_PATH = (BASE ? BASE + '/' : '/') + 'img/courier.png';
const LOGO_PATH = (BASE ? BASE + '/' : '/') + 'img/logo.png';

export const imgCourier = new Image();
export const imgLogo = new Image();

imgCourier.src = COURIER_PATH;
imgLogo.src = LOGO_PATH;

export function isCourierLoaded() {
  return imgCourier.complete && imgCourier.naturalWidth > 0;
}

export function isLogoLoaded() {
  return imgLogo.complete && imgLogo.naturalWidth > 0;
}
