/**
 * api.js — sendReward(), calculateReward()
 * POST /game/reward с user_id из URL, distance, bonuses_collected, reward, timestamp.
 */

import { API_URL, API_KEY, API_TIMEOUT_MS, REWARD_TABLE, REWARD_BONUS_MULTIPLIER } from './config.js';

/**
 * Получить user_id из query (?user_id=...).
 * @returns {string}
 */
export function getUserId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('user_id') || '';
}

/**
 * Рассчитать базовые баллы по метрам (таблица наград).
 * @param {number} meters
 * @returns {number}
 */
function getBaseReward(meters) {
  for (let i = REWARD_TABLE.length - 1; i >= 0; i--) {
    if (meters >= REWARD_TABLE[i].minMeters && meters <= REWARD_TABLE[i].maxMeters) {
      return REWARD_TABLE[i].baseReward;
    }
  }
  return 0;
}

/**
 * Рассчитать итоговые баллы: базовые по метрам + бонусы × 2.
 * @param {number} distance — пройденные метры
 * @param {number} bonusesCollected — количество собранных бонусов
 * @returns {number}
 */
export function calculateReward(distance, bonusesCollected) {
  const base = getBaseReward(distance);
  const bonus = bonusesCollected * REWARD_BONUS_MULTIPLIER;
  return base + bonus;
}

/**
 * Отправить награду на API.
 * @param {number} distance — метры
 * @param {number} bonusesCollected
 * @param {number} reward — итоговые баллы
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export function sendReward(distance, bonusesCollected, reward) {
  const userId = getUserId();
  const url = `${API_URL.replace(/\/$/, '')}/game/reward`;
  const body = JSON.stringify({
    user_id: userId,
    distance: Math.floor(distance),
    bonuses_collected: bonusesCollected,
    reward,
    timestamp: new Date().toISOString(),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body,
    signal: controller.signal,
  })
    .then((res) => {
      clearTimeout(timeoutId);
      if (res.ok) return { ok: true };
      return res.text().then((t) => ({ ok: false, error: t || res.statusText }));
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') return { ok: false, error: 'Таймаут' };
      return { ok: false, error: err.message || 'Ошибка сети' };
    });
}
