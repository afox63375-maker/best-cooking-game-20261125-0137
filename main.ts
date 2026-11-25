// Sizzle & Serve: the hand-in program (Node 22, standard library only). It copies
// the game (game/) and its screenshots (screenshots/) from beside this file into
// the output directory and writes /output/dossier.json with the vendored make.fun
// library, so the scorer can read the entry exactly as it was built.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

/** Refuses early with a plain message when the entry is missing its game. */
function requireGame() {
  const index = join(here, 'game', 'index.html');
  if (!existsSync(index) || !statSync(index).isFile()) {
    throw new Error('hand-in: game/index.html is missing — the game is not ready to hand in');
  }
}

/** Counts the files under a directory, recursively, for the run's summary line. */
function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    total += entry.isDirectory() ? countFiles(path) : 1;
  }
  return total;
}

requireGame();
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or
// one over 256 KiB; more than 993 files in game/ or 48 MiB of game files, in all,
// or a path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// A one-line summary on stdout (it never reaches the dossier, which must stay byte-identical).
console.log(
  `sizzle-and-serve: handed in ${countFiles(join(out, 'game'))} game files and ` +
    `${readdirSync(join(out, 'screenshots')).length} screenshots to ${out}`,
);
