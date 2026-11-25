// Keyboard and mouse input: key presses become one-shot actions, clicks become
// points the loop maps onto the kitchen's bins, plate and serve button. The canvas
// listens, and the loop drains the queue once per frame.

/** Action bits the loop reads from takeActions(). */
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_SERVE = 4;
export const ACTION_REMOVE = 8;
export const ACTION_MUTE = 16;

/** Digit keys 1..7, in the same order as the ingredient bins on the counter. */
const INGREDIENT_KEYS = ['1', '2', '3', '4', '5', '6', '7'];

/**
 * Hooks keyboard and pointer events onto the canvas and queues what happened.
 * @param {HTMLCanvasElement} canvas
 */
export function createInput(canvas) {
  let actions = 0;
  /** Ingredient ids queued by digit keys, drained in order. */
  const queuedIngredients = [];
  /** Click points in canvas pixels, drained in order. */
  const clicks = [];
  /** Current pointer position, for hover highlights. */
  let hover = null;

  function keyDown(event) {
    const key = event.key;
    if (key === ' ' || key === 'Enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (key === 'p' || key === 'P' || key === 'Escape') {
      actions |= ACTION_PAUSE;
    } else if (key === 's' || key === 'S') {
      actions |= ACTION_SERVE;
    } else if (key === 'Backspace') {
      actions |= ACTION_REMOVE;
      event.preventDefault();
    } else if (key === 'm' || key === 'M') {
      actions |= ACTION_MUTE;
    } else if (INGREDIENT_KEYS.includes(key)) {
      queuedIngredients.push(Number(key) - 1);
    }
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function pointerDown(event) {
    clicks.push(pointFromEvent(event));
  }

  function pointerMove(event) {
    hover = pointFromEvent(event);
  }

  window.addEventListener('keydown', keyDown);
  canvas.addEventListener('pointerdown', pointerDown);
  canvas.addEventListener('pointermove', pointerMove);
  canvas.addEventListener('pointerleave', () => {
    hover = null;
  });

  return {
    /** The action bits pressed since the last call, then cleared. */
    takeActions() {
      const held = actions;
      actions = 0;
      return held;
    },
    /** Ingredient-bin indexes queued by digit keys, in order, then cleared. */
    takeIngredientKeys() {
      return queuedIngredients.splice(0);
    },
    /** Click points since the last call, then cleared. */
    takeClicks() {
      return clicks.splice(0);
    },
    /** The pointer's current canvas position, or null when it left the canvas. */
    hoverPosition() {
      return hover;
    },
  };
}
