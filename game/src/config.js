// Sizzle & Serve: the numbers and the menu. One place for every tunable value so the
// rest of the game reads like a recipe card instead of a pile of magic numbers.

/** Logical canvas size; the renderer scales it to the browser window. */
export const VIEW_W = 1280;
export const VIEW_H = 720;

/** Fixed-step length in seconds: the world advances in these slices. */
export const STEP = 1 / 60;

/** How long a shift lasts, in seconds. */
export const SHIFT_SECONDS = 150;

/** How many expired orders end the shift early. */
export const MAX_MISSED = 3;

/** Seconds an order lives on the board before the customer walks out. */
export const ORDER_SECONDS = 45;

/** Seconds between new orders arriving (shrinks as the rush builds). */
export const ORDER_GAP_EARLY = 14;
export const ORDER_GAP_LATE = 9;

/** Points for serving a dish, plus a bonus per second left on its ticket. */
export const SERVE_POINTS = 100;
export const TIME_BONUS_PER_SECOND = 2;

/** Dishes served for each star at the end of the shift. */
export const STAR_THRESHOLDS = [4, 8, 12];

/** Local storage key for the best score. */
export const BEST_KEY = 'sizzle-and-serve-best';

/** One ingredient: its id, label, key the player presses, and its two drawing colours. */
export const INGREDIENTS = [
  { id: 'bun', label: 'Bun', key: '1', main: '#e8b06a', dark: '#b97f3a' },
  { id: 'patty', label: 'Patty', key: '2', main: '#7a4a28', dark: '#542f16' },
  { id: 'lettuce', label: 'Lettuce', key: '3', main: '#7cc24a', dark: '#4d8a26' },
  { id: 'tomato', label: 'Tomato', key: '4', main: '#e5484d', dark: '#a92c30' },
  { id: 'cheese', label: 'Cheese', key: '5', main: '#f7c948', dark: '#c99a1e' },
  { id: 'pasta', label: 'Pasta', key: '6', main: '#f2a541', dark: '#b97a1d' },
  { id: 'sauce', label: 'Sauce', key: '7', main: '#c0392b', dark: '#7e2318' },
];

/** The menu: every dish the board can ask for, as a list of ingredient ids. */
export const RECIPES = [
  { id: 'burger', name: 'Classic Burger', needs: ['bun', 'patty', 'lettuce', 'tomato'] },
  { id: 'cheeseburger', name: 'Cheesy Burger', needs: ['bun', 'patty', 'cheese'] },
  { id: 'salad', name: 'Garden Salad', needs: ['lettuce', 'tomato', 'cheese'] },
  { id: 'pasta', name: 'Cheesy Pasta', needs: ['pasta', 'sauce', 'cheese'] },
  { id: 'sandwich', name: 'Garden Sandwich', needs: ['bun', 'lettuce', 'tomato', 'cheese'] },
];

/** Lookup for an ingredient by id. */
export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id);
}

/** Lookup for a recipe by id. */
export function recipeById(id) {
  return RECIPES.find((dish) => dish.id === id);
}
