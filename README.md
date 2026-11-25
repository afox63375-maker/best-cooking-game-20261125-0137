[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/afox63375-maker/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/afox63375-maker/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

# 🍳 Sizzle & Serve — Rush-Hour Kitchen

A complete, original cooking game for the make.fun best-cooking-game bounty. You are the cook on a 150-second shift: orders land on the board with a countdown, you stack ingredients from the counter onto your plate, and you serve each dish before its timer runs out. Serve fast for bonus points; three missed orders end the shift.

## How to play

- **Orders arrive** on the board (top left). Each ticket names a dish and the ingredients it needs, with a countdown bar that turns red as time runs out.
- **Build the dish** by clicking ingredient bins on the counter, or pressing keys **1–7**. Ingredients stack on your plate in the middle of the kitchen.
- **Serve** with the green SERVE button, **Enter**, or **S**. The button lights up when your plate matches an order. Serving fast earns a time bonus; serving dishes back-to-back builds a combo.
- **Wrong ingredient?** Click the plate (or press **Backspace**) to take the last one off.
- **Shift ends** when the 2:30 timer hits zero — or early, if three orders walk out. Earn up to 3 stars for dishes served (4 / 8 / 12).

## Controls

| Input | Action |
| --- | --- |
| Mouse click on a bin | Add that ingredient to the plate |
| Keys 1–7 | Add Bun, Patty, Lettuce, Tomato, Cheese, Pasta, Sauce |
| SERVE button / Enter / S | Serve the plate when it matches an order |
| Click plate / Backspace | Remove the last ingredient |
| P or Esc | Pause / resume |
| M | Mute / unmute |
| Space | Start a shift / cook again |

## The menu

- **Classic Burger** — bun, patty, lettuce, tomato
- **Cheesy Burger** — bun, patty, cheese
- **Garden Salad** — lettuce, tomato, cheese
- **Cheesy Pasta** — pasta, sauce, cheese
- **Garden Sandwich** — bun, lettuce, tomato, cheese

## Files

- `game/index.html` — the page; open it from any static server
- `game/style.css` — page layout around the canvas
- `game/src/main.js` — boot, the fixed-step loop, screens
- `game/src/config.js` — tuning values, ingredients and the menu
- `game/src/world.js` — orders, the plate, scoring, the shift clock
- `game/src/render.js` — all Canvas 2D drawing: kitchen, board, stove, plate
- `game/src/input.js` — keyboard and mouse input
- `game/src/sound.js` — WebAudio-synthesized sounds (no audio files)
- `game/src/random.js` — seeded random source for reproducible runs
- `game/src/shots.js` — deterministic screenshot scenes (`?shot=kitchen|title|serve|win&seed=1`)
- `main.ts` — the hand-in program (Node 22 stdlib only): copies `game/` and `screenshots/` to `/output` and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
- `screenshots/` — four real renders of the game in headless Chromium

## Screenshots

All four are real renders of the game's own code in headless Chromium, staged deterministically with `?shot=…&seed=1`:

1. `01-kitchen.jpg` — the cover: mid-rush, three orders on the board, a burger half-built on the plate, the shift timer running.
2. `02-title.jpg` — the title screen and how to play, over the kitchen.
3. `03-serve.jpg` — a finished Classic Burger on the plate, matching its order, SERVE lit.
4. `04-win.jpg` — shift complete: three stars, 13 dishes served.

## Design notes

- **Pressure without chores:** the only actions are pick, remove and serve. The depth is in the route — which order to build first when three tickets race their timers — and the gap between orders tightens as the shift goes on.
- **Readable at a glance:** every ticket shows its dish as ingredient icons, not words; the plate shows the same icons stacked; the SERVE button only lights when the plate matches a live order.
- **Original art and sound:** every ingredient, the stove, the window and the tiles are drawn in code with Canvas 2D, and every sound is a synthesized WebAudio blip. No assets, no libraries, no network.

## Play it

Serve `game/` with any static server (for example `python3 -m http.server` inside `game/`) and open `index.html` in desktop Chrome. Everything is drawn in code and every sound is synthesized — the game makes no network requests.

## License

MIT — see `LICENSE`.
