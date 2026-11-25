// Deterministic screenshot scenes: ?shot=kitchen|title|serve|win&seed=1 stages a fixed
// kitchen state (orders on the board, a dish mid-assembly, a plate ready to serve)
// so every screenshot is reproducible from the game's own code.

import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/**
 * Stages one named scene on a fresh world and returns which screen to paint and
 * which banner to show above it.
 * @param {string} name kitchen | title | serve | win
 * @param {object} world the world (its reset/step/serve methods and state)
 * @returns {{ screen: string, banner: { text: string, color: string } | null }}
 */
export function stageShot(name, world) {
  if (name === 'title') {
    world.reset();
    return { screen: SCREEN_TITLE, banner: null };
  }
  if (name === 'win') {
    world.reset();
    world.state.timeLeft = 0.5;
    world.state.score = 1240;
    world.state.served = 13;
    world.state.missed = 1;
    world.state.over = true;
    world.state.won = true;
    world.state.plate = ['bun', 'patty', 'lettuce', 'tomato'];
    return { screen: SCREEN_OVER, banner: null };
  }
  if (name === 'serve') {
    world.reset();
    // A busy board with one ticket nearly done, and a finished burger on the plate.
    world.state.orders = [
      { id: 1, recipeId: 'burger', name: 'Classic Burger', needs: ['bun', 'patty', 'lettuce', 'tomato'], timeLeft: 21, total: 45, warned: false },
      { id: 2, recipeId: 'pasta', name: 'Cheesy Pasta', needs: ['pasta', 'sauce', 'cheese'], timeLeft: 34, total: 45, warned: false },
      { id: 3, recipeId: 'salad', name: 'Garden Salad', needs: ['lettuce', 'tomato', 'cheese'], timeLeft: 12, total: 45, warned: true },
    ];
    world.state.plate = ['bun', 'patty', 'lettuce', 'tomato'];
    world.state.score = 640;
    world.state.served = 5;
    world.state.timeLeft = 118;
    return { screen: SCREEN_PLAY, banner: { text: '✓ Classic Burger ready to serve!', color: '#2e7d32' } };
  }
  // kitchen: the cover shot — mid-rush, a dish half-built on the plate.
  world.reset();
  world.state.orders = [
    { id: 1, recipeId: 'burger', name: 'Classic Burger', needs: ['bun', 'patty', 'lettuce', 'tomato'], timeLeft: 28, total: 45, warned: false },
    { id: 2, recipeId: 'pasta', name: 'Cheesy Pasta', needs: ['pasta', 'sauce', 'cheese'], timeLeft: 38, total: 45, warned: false },
    { id: 3, recipeId: 'salad', name: 'Garden Salad', needs: ['lettuce', 'tomato', 'cheese'], timeLeft: 9, total: 45, warned: true },
  ];
  world.state.plate = ['bun', 'patty', 'lettuce'];
  world.state.score = 420;
  world.state.served = 3;
  world.state.timeLeft = 132;
  return { screen: SCREEN_PLAY, banner: null };
}
