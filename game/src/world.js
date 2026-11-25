// The kitchen's state and its rules: orders arriving on the board, the plate being
// assembled, serving, expiring orders, and the end of the shift. No drawing here —
// the renderer reads this state and paints it.

import {
  MAX_MISSED,
  ORDER_GAP_EARLY,
  ORDER_GAP_LATE,
  ORDER_SECONDS,
  RECIPES,
  SERVE_POINTS,
  SHIFT_SECONDS,
  STAR_THRESHOLDS,
  TIME_BONUS_PER_SECOND,
} from './config.js';

/** Event bits a step can report, so the loop can play sounds and announce them. */
export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_OVER = 4;
export const EVENT_TICK = 8;

/** How many orders the board holds at once. */
const BOARD_SLOTS = 3;

/** The same multiset of ingredients, order-insensitive: sorted ids joined. */
function plateKey(items) {
  return [...items].sort().join(',');
}

/**
 * Creates a fresh kitchen around a seeded random source. The world owns the shift
 * clock, the orders, the plate, the score and the hearts; the loop steps it.
 * @param {{ next: () => number, int: (max: number) => number, pick: (list: any[]) => any }} random
 */
export function createWorld(random) {
  const state = {
    timeLeft: SHIFT_SECONDS,
    score: 0,
    served: 0,
    missed: 0,
    combo: 0,
    orders: [],
    plate: [],
    over: false,
    won: false,
    nextOrderIn: 2,
    orderNumber: 0,
  };

  function spawnOrder() {
    const recipe = random.pick(RECIPES);
    state.orderNumber += 1;
    state.orders.push({
      id: state.orderNumber,
      recipeId: recipe.id,
      name: recipe.name,
      needs: [...recipe.needs],
      timeLeft: ORDER_SECONDS,
      total: ORDER_SECONDS,
      warned: false,
    });
  }

  function reset() {
    state.timeLeft = SHIFT_SECONDS;
    state.score = 0;
    state.served = 0;
    state.missed = 0;
    state.combo = 0;
    state.orders = [];
    state.plate = [];
    state.over = false;
    state.won = false;
    state.nextOrderIn = 2;
    state.orderNumber = 0;
    spawnOrder();
    spawnOrder();
  }

  /** Adds one ingredient to the plate; the plate holds at most six items. */
  function addIngredient(id) {
    if (state.over || state.plate.length >= 6) return false;
    state.plate.push(id);
    return true;
  }

  /** Takes the last ingredient back off the plate. */
  function removeLastIngredient() {
    if (state.over || state.plate.length === 0) return false;
    state.plate.pop();
    return true;
  }

  /** The order the plate currently matches, or null when it matches none. */
  function matchingOrder() {
    const key = plateKey(state.plate);
    if (state.plate.length === 0) return null;
    return state.orders.find((order) => plateKey(order.needs) === key) ?? null;
  }

  /**
   * Serves the plate when it matches an order: scores the dish, clears the plate
   * and drops the ticket. Returns the served order, or null when nothing matches.
   */
  function serve() {
    if (state.over) return null;
    const order = matchingOrder();
    if (!order) return null;
    const bonus = Math.ceil(order.timeLeft) * TIME_BONUS_PER_SECOND;
    state.combo += 1;
    state.score += SERVE_POINTS + bonus + (state.combo > 1 ? (state.combo - 1) * 10 : 0);
    state.served += 1;
    state.orders = state.orders.filter((item) => item.id !== order.id);
    state.plate = [];
    return order;
  }

  /** Stars earned from the dishes served so far. */
  function stars() {
    return STAR_THRESHOLDS.filter((threshold) => state.served >= threshold).length;
  }

  /**
   * Advances the shift by dt seconds. Returns event bits: served orders are
   * reported by serve() itself, so this reports expiries, last-second ticks and
   * the end of the shift.
   */
  function step(dt) {
    if (state.over) return 0;
    let events = 0;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.over = true;
      state.won = state.missed < MAX_MISSED;
      return events | EVENT_OVER;
    }
    // New orders arrive on a gap that tightens as the shift goes on.
    state.nextOrderIn -= dt;
    if (state.nextOrderIn <= 0 && state.orders.length < BOARD_SLOTS) {
      spawnOrder();
      const progress = 1 - state.timeLeft / SHIFT_SECONDS;
      state.nextOrderIn = ORDER_GAP_EARLY + (ORDER_GAP_LATE - ORDER_GAP_EARLY) * progress;
    }
    for (const order of [...state.orders]) {
      const before = Math.ceil(order.timeLeft);
      order.timeLeft -= dt;
      const after = Math.ceil(order.timeLeft);
      if (after <= 10 && after !== before && after > 0) {
        events |= EVENT_TICK;
        order.warned = true;
      }
      if (order.timeLeft <= 0) {
        state.orders = state.orders.filter((item) => item.id !== order.id);
        state.missed += 1;
        state.combo = 0;
        events |= EVENT_EXPIRED;
        if (state.missed >= MAX_MISSED) {
          state.over = true;
          state.won = false;
          events |= EVENT_OVER;
        }
      }
    }
    return events;
  }

  return { state, reset, addIngredient, removeLastIngredient, matchingOrder, serve, stars, step };
}
