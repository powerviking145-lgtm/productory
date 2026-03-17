/**
 * game.js — главный класс, цикл, связь модулей
 * Экраны: старт, игра, game over. Тап = прыжок, HUD внутри canvas.
 */

import { getCtx, getCanvas, init as initRenderer, resize } from './renderer.js';
import { setOnJump, init as initInput, vibrate } from './input.js';
import * as player from './player.js';
import * as obstacles from './obstacles.js';
import * as bonuses from './bonuses.js';
import * as background from './background.js';
import * as collision from './collision.js';
import * as particles from './particles.js';
import * as sound from './sound.js';
import * as api from './api.js';
import * as ui from './ui.js';
import {
  VW,
  VH,
  GROUND_Y,
  SPEED_INIT,
  SPEED_MAX,
  SPEED_INCREMENT,
  METERS_PER_PIXEL,
  METER_DISPLAY_DIGITS,
  BONUS_MAX_PER_GAME,
  COLOR_HUD,
  GAME_OVER_OVERLAY,
  GAME_OVER_SHAKE_MS,
  GAME_OVER_DELAY_MS,
} from './config.js';
import { imgLogo, isLogoLoaded } from './assets.js';

const HUD_ICON_SIZE = 14;

let state = 'start';  // start | playing | gameover
let speed = SPEED_INIT;
let totalDistance = 0;
let rewardSent = false;
let shakeEnd = 0;
let canvas = null;
let lastFrameTime = 0;
const floatingTexts = [];
const collectFlashes = [];

function getMeters() {
  return Math.floor(totalDistance * METERS_PER_PIXEL);
}

function updateAndDrawFloatingTexts(ctx) {
  for (let i = collectFlashes.length - 1; i >= 0; i--) {
    const f = collectFlashes[i];
    f.r += 2.5;
    f.life--;
    if (f.life <= 0) {
      collectFlashes.splice(i, 1);
      continue;
    }
    const alpha = f.life / 14;
    ctx.strokeStyle = `rgba(255, 220, 0, ${alpha})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.font = '12px "Press Start 2P"';
  ctx.textAlign = 'center';
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.y -= 1.2;
    t.life--;
    if (t.life <= 0) {
      floatingTexts.splice(i, 1);
      continue;
    }
    const alpha = Math.min(1, t.life / 20);
    ctx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
    ctx.strokeStyle = `rgba(0,0,0,${alpha * 0.5})`;
    ctx.lineWidth = 1;
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = COLOR_HUD;
}

function drawHUD(ctx) {
  const meters = getMeters();
  const metersStr = String(meters).padStart(METER_DISPLAY_DIGITS, '0');
  const collected = bonuses.getCollectedCount();
  const bonusStr = `${collected}/${BONUS_MAX_PER_GAME}`;
  ctx.font = '14px "Press Start 2P"';
  ctx.fillStyle = COLOR_HUD;
  const iconX = 15;
  const iconY = 22 - HUD_ICON_SIZE;
  if (isLogoLoaded() && imgLogo.naturalWidth) {
    ctx.drawImage(imgLogo, iconX, iconY, HUD_ICON_SIZE, HUD_ICON_SIZE);
    ctx.fillText(bonusStr, iconX + HUD_ICON_SIZE + 4, 22);
  } else {
    ctx.fillText('📦 ' + bonusStr, iconX, 22);
  }
  ctx.fillText(metersStr + ' м', VW - 15 - ctx.measureText(metersStr + ' м').width, 22);
}

function drawStartScreen(ctx) {
  background.draw(ctx);
  ctx.fillStyle = COLOR_HUD;
  ctx.font = '24px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('КУРЬЕР', VW / 2, 140);
  ctx.font = '14px "Press Start 2P"';
  ctx.fillText('РАННЕР', VW / 2, 180);
  player.draw(ctx, { center: true, meters: 0 });
  ctx.font = '12px "Press Start 2P"';
  const blink = Math.floor(Date.now() / 400) % 2 === 0;
  if (blink) ctx.fillText('ТАПНИ ЧТОБЫ НАЧАТЬ', VW / 2, 320);
  ctx.textAlign = 'left';
}

function drawGameOverOverlay(ctx) {
  ctx.fillStyle = GAME_OVER_OVERLAY;
  ctx.fillRect(0, 0, VW, VH);
  ctx.fillStyle = COLOR_HUD;
  ctx.font = '20px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', VW / 2, 240);
  ctx.font = '12px "Press Start 2P"';
  ctx.fillText('Пройдено: ' + getMeters() + ' м', VW / 2, 280);
  ctx.fillText('Бонусы: ' + bonuses.getCollectedCount() + '/' + BONUS_MAX_PER_GAME, VW / 2, 310);
  ctx.textAlign = 'left';
}

function startGame() {
  state = 'playing';
  speed = SPEED_INIT;
  totalDistance = 0;
  rewardSent = false;
  player.reset();
  obstacles.reset();
  bonuses.reset();
  particles.update(); // очистить старые частицы через update
  background.reset();
  obstacles.setSpeed(speed);
  bonuses.setSpeed(speed);
  background.setSpeed(speed);
  ui.hideButtons();
}

function doJump() {
  if (state !== 'playing') {
    if (state === 'start') {
      startGame();
    }
    return;
  }
  if (player.jump()) {
    sound.playJump();
  }
}

function gameOver() {
  state = 'gameover';
  vibrate(100);
  sound.playHit();
  const pos = player.getPosition();
  particles.spawnDeath(pos.x, pos.y, pos.w, pos.h);
  shakeEnd = Date.now() + GAME_OVER_SHAKE_MS;
  const collected = bonuses.getCollectedCount();
  const reward = collected;
  ui.setClaimText(reward);
  setTimeout(() => {
    ui.showButtons();
  }, GAME_OVER_DELAY_MS);
}

function loop() {
  const ctx = getCtx();
  if (!ctx) {
    requestAnimationFrame(loop);
    return;
  }

  if (state === 'start') {
    lastFrameTime = 0;
    drawStartScreen(ctx);
    requestAnimationFrame(loop);
    return;
  }

  const now = performance.now();
  const rawDt = lastFrameTime ? (now - lastFrameTime) / 1000 * 60 : 1;
  const dt = Math.min(Math.max(rawDt, 1), 3);
  lastFrameTime = now;

  if (state === 'playing') {
    speed = Math.min(SPEED_MAX, speed + SPEED_INCREMENT * dt);
    totalDistance += speed * dt;
    obstacles.setSpeed(speed);
    bonuses.setSpeed(speed);
    background.setSpeed(speed);
    bonuses.setGameDistance(totalDistance);

    obstacles.spawn(totalDistance);
    obstacles.update(dt);
    bonuses.trySpawn();
    bonuses.update(dt);
    player.update(dt);
    background.update(dt);
    particles.update(dt);

    const playerBox = player.getHitbox();
    const activeObstacles = obstacles.getActive();
    for (let i = 0; i < activeObstacles.length; i++) {
      if (collision.aabb(playerBox, activeObstacles[i])) {
        gameOver();
        requestAnimationFrame(loop);
        return;
      }
    }

    const activeBonuses = bonuses.getActive();
    for (let i = 0; i < activeBonuses.length; i++) {
      const b = activeBonuses[i];
      if (collision.aabb(playerBox, b)) {
        const pts = bonuses.collect(b.ref);
        if (pts > 0) {
          vibrate(30);
          sound.playCollect();
          particles.spawnBonus(b.x, b.y);
          floatingTexts.push({
            x: b.x + 10,
            y: b.y + 10,
            text: '+' + pts,
            life: 45,
          });
          collectFlashes.push({ x: b.x + 10, y: b.y + 10, r: 0, life: 14 });
        }
      }
    }
  }

  // Рисуем (игра или замороженный кадр + overlay)
  let shakeX = 0, shakeY = 0;
  if (state === 'gameover' && Date.now() < shakeEnd) {
    shakeX = (Math.random() - 0.5) * 8;
    shakeY = (Math.random() - 0.5) * 8;
  }

  canvas = getCanvas();
  if (canvas) {
    canvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
  }

  background.draw(ctx, totalDistance);
  obstacles.draw(ctx);
  bonuses.draw(ctx);
  player.draw(ctx, { meters: getMeters() });
  particles.draw(ctx);
  updateAndDrawFloatingTexts(ctx);

  if (state === 'playing') {
    drawHUD(ctx);
  }

  if (state === 'gameover') {
    particles.update(dt);
    drawGameOverOverlay(ctx);
    if (Date.now() >= shakeEnd && canvas) {
      canvas.style.transform = '';
    }
  }

  requestAnimationFrame(loop);
}

function onClaim() {
  if (rewardSent) return;
  const reward = bonuses.getCollectedCount();
  ui.setClaimSending();
  api.sendReward(getMeters(), bonuses.getCollectedCount(), reward).then((res) => {
    if (res.ok) {
      rewardSent = true;
      ui.setClaimSuccess();
    } else {
      ui.setClaimError();
    }
  });
}

function onRestart() {
  floatingTexts.length = 0;
  collectFlashes.length = 0;
  ui.hideButtons();
  startGame();
}

function init() {
  document.addEventListener('touchstart', (e) => {
    if (!e.target.closest('button') && !e.target.closest('#gameOverButtons')) e.preventDefault();
  }, { passive: false });
  document.addEventListener('touchmove', (e) => {
    if (!e.target.closest('button') && !e.target.closest('#gameOverButtons')) e.preventDefault();
  }, { passive: false });
  initRenderer();
  initInput();
  setOnJump(doJump);
  ui.bindButtons({ onClaim, onRestart });
  resize();
  loop();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
