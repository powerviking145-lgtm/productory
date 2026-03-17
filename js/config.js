/**
 * config.js — все константы, размеры, API для игры "Курьер-раннер"
 * Виртуальное разрешение: 400×600 (портрет)
 */

// ——— Canvas и экран ———
export const VW = 400;  // виртуальная ширина
export const VH = 600;  // виртуальная высота
export const CANVAS_HEIGHT_PERCENT = 0.5;  // canvas = 50% высоты окна (вебвью может быть половиной экрана)
export const MIN_WIDTH = 320;

// ——— Физика ———
export const GRAVITY = 0.35;
export const JUMP_FORCE = -13;
export const GROUND_Y = 500;
export const PLAYER_X = 60;  // 15% от 400 ≈ 60

// ——— Скорость ———
export const SPEED_INIT = 1.8;
export const SPEED_MAX = 10;
export const SPEED_INCREMENT = 0.0005;

// ——— Препятствия ———
export const OBSTACLE_GAP_MIN = 720;
export const OBSTACLE_GAP_MAX = 1600;
export const OBSTACLE_HEIGHTS = [30, 45, 60];  // виртуальные пиксели
export const OBSTACLE_SPAWN_X = VW + 50;  // за правым краем

// ——— Бонусы ———
export const BONUS_SPAWN_CHANCE = 0.012;  // 1.2% за кадр
export const BONUS_MIN_Y_OFFSET = 40;   // от земли вверх
export const BONUS_MAX_Y_OFFSET = 200;
export const BONUS_MIN_DISTANCE = 100;  // мин. расстояние от последнего
export const BONUS_MAX_ON_SCREEN = 3;
export const BONUS_MAX_PER_GAME = 50;
export const BONUS_SIZE = 20;
export const BONUS_BOB_AMPLITUDE = 3;
export const BONUS_BOB_SPEED = 0.08;

// ——— Типы бонусов: id, очки, цвет ———
export const BONUS_TYPES = [
  { id: 'package', points: 1, color: '#8B4513' },   // посылка, коричневый
  { id: 'pizza', points: 1, color: '#FFD700' },     // пицца, жёлто-красный (золотой)
  { id: 'burger', points: 2, color: '#FF8C00' },    // бургер, оранжевый
  { id: 'star', points: 3, color: '#FFD700' },      // звезда, золотой
  { id: 'diamond', points: 5, color: '#00BFFF' },   // алмаз, голубой
];

// ——— Счёт ———
export const METERS_PER_PIXEL = 1 / 8;  // метры = пиксели / 8
export const METER_DISPLAY_DIGITS = 5;

// ——— Персонаж ———
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 50;
export const PLAYER_COLOR = '#00BFFF';
export const SCOOTER_COLOR = '#333';
export const HITBOX_PLAYER_SCALE = 0.75;   // хитбокс на 25% меньше
export const HITBOX_OBSTACLE_SCALE = 0.9;  // хитбокс препятствия на 10% меньше

// ——— Частицы ———
export const PARTICLE_MAX = 20;
export const DEATH_PARTICLE_COUNT = 18;
export const BONUS_PARTICLE_COUNT = 6;

// ——— API ———
export const API_URL = 'https://api.example.com';  // заменить на реальный URL
export const API_KEY = '';  // задать ключ
export const API_TIMEOUT_MS = 10000;
export const REWARD_BONUS_MULTIPLIER = 2;  // каждый бонус × 2 к баллам

// Таблица наград по метрам (включительно)
// Метры 0-99: 0, 100-299: 5, 300-499: 15, 500-999: 25, 1000+: 50
export const REWARD_TABLE = [
  { minMeters: 0, maxMeters: 99, baseReward: 0 },
  { minMeters: 100, maxMeters: 299, baseReward: 5 },
  { minMeters: 300, maxMeters: 499, baseReward: 15 },
  { minMeters: 500, maxMeters: 999, baseReward: 25 },
  { minMeters: 1000, maxMeters: Infinity, baseReward: 50 },
];

// ——— Цвета и стиль ———
export const COLOR_BG = '#FFFFFF';
export const COLOR_GROUND = '#000000';
export const COLOR_OBSTACLE = '#333333';
export const COLOR_HUD = '#333333';
export const COLOR_CLOUD = '#E0E0E0';
export const COLOR_ROCK = '#666666';

// ——— Game Over ———
export const GAME_OVER_OVERLAY = 'rgba(255, 255, 255, 0.7)';
export const GAME_OVER_SHAKE_MS = 200;
export const GAME_OVER_DELAY_MS = 500;
export const BUTTONS_DELAY_MS = 500;
