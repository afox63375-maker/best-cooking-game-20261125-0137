// Sizzle & Serve: boot, the fixed-step loop, and the screens. Input is read every
// frame, the world advances in 1/60 s steps, and the renderer paints what is there.
//
// ?seed=N fixes the order pattern. ?shot=kitchen|title|serve|win (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_EXPIRED, EVENT_OVER, EVENT_TICK } from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_REMOVE,
  ACTION_SERVE,
  createInput,
} from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { createSoundBoard } from './sound.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall is dropped, not replayed. */
const MAX_FRAME = 0.25;
/** How long a serve banner stays on screen, in milliseconds. */
const BANNER_MS = 1600;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const sounds = createSoundBoard();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  const best = name === 'win' ? 1240 : readBest();
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, best, {
      hover: null,
      banner: scene.banner,
      match: world.matchingOrder(),
      now: 0,
    });
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  const zones = renderer.layout();
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let banner = null;
  let bannerUntil = 0;

  function announce(message) {
    status.textContent = message;
  }

  function showBanner(text, color) {
    banner = { text, color };
    bannerUntil = performance.now() + BANNER_MS;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    banner = null;
    screen = SCREEN_PLAY;
    announce('Playing. Orders are coming in — build each dish and serve it in time.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    sounds.fanfare(world.state.won);
    announce(
      world.state.won
        ? `Shift complete. ${world.state.served} dishes served, score ${world.state.score}.`
        : `Shift over. ${world.state.served} dishes served, score ${world.state.score}.`,
    );
  }

  function tryServe() {
    const before = world.state.score;
    const order = world.serve();
    if (order) {
      sounds.serve();
      showBanner(`Served ${order.name}! +${world.state.score - before} pts`, '#2e7d32');
      announce(`Served ${order.name}. Score ${world.state.score}.`);
    } else if (world.state.plate.length > 0) {
      sounds.buzz();
      showBanner('Not a full order yet — check the board!', '#c0392b');
    }
  }

  function addFromPoint(point) {
    for (const bin of zones.bins) {
      if (point.x >= bin.x && point.x <= bin.x + bin.w && point.y >= bin.y && point.y <= bin.y + bin.h) {
        if (world.addIngredient(bin.id)) {
          sounds.pop();
          announce(`Added ${bin.id}.`);
        }
        return true;
      }
    }
    if (point.x >= zones.serve.x && point.x <= zones.serve.x + zones.serve.w && point.y >= zones.serve.y && point.y <= zones.serve.y + zones.serve.h) {
      tryServe();
      return true;
    }
    if (point.x >= zones.plate.x && point.x <= zones.plate.x + zones.plate.w && point.y >= zones.plate.y && point.y <= zones.plate.y + zones.plate.h) {
      if (world.removeLastIngredient()) sounds.pop();
      return true;
    }
    return false;
  }

  function handleInput() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = sounds.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) {
      sounds.unlock();
      startGame();
      return;
    }
    if (screen !== SCREEN_PLAY && screen !== SCREEN_PAUSED) return;
    if (actions & ACTION_PAUSE) {
      screen = screen === SCREEN_PLAY ? SCREEN_PAUSED : SCREEN_PLAY;
      announce(screen === SCREEN_PAUSED ? 'Paused.' : 'Playing.');
      return;
    }
    if (screen !== SCREEN_PLAY) return;
    for (const index of input.takeIngredientKeys()) {
      const item = zones.bins[index];
      if (item && world.addIngredient(item.id)) sounds.pop();
    }
    if (actions & ACTION_REMOVE) {
      if (world.removeLastIngredient()) sounds.pop();
    }
    if (actions & (ACTION_SERVE | ACTION_CONFIRM)) tryServe();
    for (const point of input.takeClicks()) {
      sounds.unlock();
      addFromPoint(point);
    }
  }

  function stepWorld() {
    if (screen === SCREEN_TITLE) return;
    const events = world.step(STEP);
    if (events & EVENT_TICK) sounds.tick();
    if (events & EVENT_EXPIRED) {
      sounds.buzz();
      showBanner('An order walked out! One heart lost.', '#c0392b');
      announce(`An order expired. ${world.state.missed} missed.`);
    }
    if (events & EVENT_OVER) endGame();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleInput();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        stepWorld();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    if (banner && now > bannerUntil) banner = null;
    renderer.draw(world.state, screen, best, {
      hover: input.hoverPosition(),
      banner,
      match: world.matchingOrder(),
      now,
    });
  }

  // Leaving the tab pauses a running game rather than letting orders expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Sizzle and Serve. Press Space or click to start cooking.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
