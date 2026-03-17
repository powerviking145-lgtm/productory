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

let state = 'start';  // start | playing | gameover
let speed = SPEED_INIT;
let totalDistance = 0;
let rewardSent = false;
let shakeEnd = 0;
let canvas = null;

function getMeters() {
  return Math.floor(totalDistance * METERS_PER_PIXEL);
}

function drawHUD(ctx) {
  const meters = getMeters();
  const metersStr = String(meters).padStart(METER_DISPLAY_DIGITS, '0');
  const bonusStr = `${bonuses.getCollectedCount()}/${BONUS_MAX_PER_GAME}`;
  ctx.font = '14px "Press Start 2P"';
  ctx.fillStyle = COLOR_HUD;
  ctx.fillText('📦 ' + bonusStr, 15, 22);
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
  player.draw(ctx, { center: true });
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
  const reward = api.calculateReward(getMeters(), bonuses.getCollectedCount());
  ui.setClaimText('Забрать ' + reward + ' ⭐');
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
    drawStartScreen(ctx);
    requestAnimationFrame(loop);
    return;
  }

  if (state === 'playing') {
    speed = Math.min(SPEED_MAX, speed + SPEED_INCREMENT);
    totalDistance += speed;
    obstacles.setSpeed(speed);
    bonuses.setSpeed(speed);
    background.setSpeed(speed);
    bonuses.setGameDistance(totalDistance);

    obstacles.spawn(totalDistance);
    obstacles.update();
    bonuses.trySpawn();
    bonuses.update();
    player.update();
    background.update();
    particles.update();

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

  background.draw(ctx);
  obstacles.draw(ctx);
  bonuses.draw(ctx);
  player.draw(ctx);
  particles.draw(ctx);

  if (state === 'playing') {
    drawHUD(ctx);
  }

  if (state === 'gameover') {
    particles.update();
    drawGameOverOverlay(ctx);
    if (Date.now() >= shakeEnd && canvas) {
      canvas.style.transform = '';
    }
  }

  requestAnimationFrame(loop);
}

function onClaim() {
  if (rewardSent) return;
  const reward = api.calculateReward(getMeters(), bonuses.getCollectedCount());
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
