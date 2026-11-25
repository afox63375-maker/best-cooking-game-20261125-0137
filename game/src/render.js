// Everything the player sees, painted with Canvas 2D: the tiled kitchen, the order
// board, the stove, the plate being assembled, the ingredient counter and the
// screens around the game. All art is drawn in code; there are no image files.

import { INGREDIENTS, SERVE_POINTS, VIEW_H, VIEW_W, ingredientById } from './config.js';

/** The screens the renderer can paint. */
export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

/** Hit zones, in logical pixels, shared with the loop's click handling. */
const BINS_Y = 584;
const BINS_H = 112;
const PLATE = { x: 470, y: 408, w: 300, h: 156 };
const SERVE = { x: 830, y: 428, w: 220, h: 96 };

/** The counter bins: one zone per ingredient, laid out left to right. */
function binZones() {
  const gap = 12;
  const total = VIEW_W - 48;
  const width = (total - gap * (INGREDIENTS.length - 1)) / INGREDIENTS.length;
  return INGREDIENTS.map((item, index) => ({
    id: item.id,
    x: 24 + index * (width + gap),
    y: BINS_Y,
    w: width,
    h: BINS_H,
  }));
}

/** A rounded rectangle path, for panels, tickets and buttons. */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A soft shadow under a panel: a dark rounded rect offset down a few pixels. */
function shadow(ctx, x, y, w, h, r) {
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  roundRect(ctx, x + 3, y + 5, w, h, r);
  ctx.fill();
}

/**
 * Draws one ingredient at (cx, cy) with radius r: a bun dome, a patty slab, a
 * lettuce leaf, a tomato, a cheese wedge, a pasta nest or a sauce dollop.
 */
export function drawIngredient(ctx, id, cx, cy, r) {
  const item = ingredientById(id);
  if (!item) return;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = item.dark;
    roundRect(ctx, -r, -r * 0.25, r * 2, r * 0.55, r * 0.2);
    ctx.fill();
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.arc(0, -r * 0.15, r * 0.95, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    for (const [sx, sy] of [[-0.4, -0.55], [0, -0.75], [0.4, -0.55]]) {
      ctx.beginPath();
      ctx.ellipse(sx * r, sy * r, r * 0.1, r * 0.06, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = item.dark;
    roundRect(ctx, -r, -r * 0.45, r * 2, r * 0.9, r * 0.4);
    ctx.fill();
    ctx.fillStyle = item.main;
    roundRect(ctx, -r * 0.92, -r * 0.55, r * 1.84, r * 0.7, r * 0.35);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (const [sx, sy] of [[-0.5, -0.2], [0.1, 0.15], [0.55, -0.25]]) {
      ctx.beginPath();
      ctx.arc(sx * r, sy * r, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = item.dark;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.arc(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.42, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = r * 0.08;
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, 0);
    ctx.quadraticCurveTo(0, -r * 0.3, r * 0.5, 0);
    ctx.stroke();
  } else if (id === 'tomato') {
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.arc(0, r * 0.08, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.25, r * 0.22, r * 0.14, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4d8a26';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(-r * 0.35, -r * 0.95);
    ctx.lineTo(0, -r * 0.8);
    ctx.lineTo(r * 0.35, -r * 0.95);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = item.dark;
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.7);
    ctx.lineTo(r, r * 0.7);
    ctx.lineTo(r * 0.2, -r * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, r * 0.55);
    ctx.lineTo(r * 0.9, r * 0.55);
    ctx.lineTo(r * 0.18, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = item.dark;
    for (const [hx, hy] of [[-0.25, 0.25], [0.3, 0.1], [0.05, -0.3]]) {
      ctx.beginPath();
      ctx.arc(hx * r, hy * r, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'pasta') {
    ctx.strokeStyle = item.main;
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.85 - i * 0.28), 0.4 + i * 0.7, 4.4 + i * 0.7);
      ctx.stroke();
    }
    ctx.strokeStyle = item.dark;
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0.5, 4.2);
    ctx.stroke();
  } else if (id === 'sauce') {
    ctx.fillStyle = item.main;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.95);
    ctx.bezierCurveTo(r * 0.8, -r * 0.1, r * 0.75, r * 0.55, 0, r * 0.9);
    ctx.bezierCurveTo(-r * 0.75, r * 0.55, -r * 0.8, -r * 0.1, 0, -r * 0.95);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(-r * 0.25, -r * 0.1, r * 0.14, r * 0.3, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A mm:ss clock from seconds. */
function clock(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

/** Creates the renderer for a canvas fixed at the logical size. */
export function createRenderer(canvas) {
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  const ctx = canvas.getContext('2d');

  function drawWall() {
    ctx.fillStyle = '#f6e3c2';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    // Warm tiles across the upper wall.
    ctx.fillStyle = '#eecfa5';
    for (let y = 64; y < 400; y += 46) {
      for (let x = (y / 46) % 2 === 0 ? 0 : -46; x < VIEW_W; x += 92) {
        ctx.fillRect(x + 2, y + 2, 88, 42);
      }
    }
    // A sunny window on the right of the kitchen.
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, 900, 84, 320, 150, 14);
    ctx.fill();
    ctx.fillStyle = '#bfe3f2';
    roundRect(ctx, 912, 96, 296, 126, 8);
    ctx.fill();
    ctx.fillStyle = '#ffe08a';
    ctx.beginPath();
    ctx.arc(1150, 130, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (const [cx, cy, w] of [[980, 150, 70], [1060, 190, 90], [1130, 165, 60]]) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, w / 2, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(1052, 96, 10, 126);
    ctx.fillRect(912, 152, 296, 10);
    // A shelf with jars above the stove.
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(500, 96, 340, 12);
    const jarColors = ['#e5484d', '#7cc24a', '#f7c948', '#c98a4b'];
    jarColors.forEach((color, i) => {
      ctx.fillStyle = color;
      roundRect(ctx, 520 + i * 80, 58, 44, 38, 6);
      ctx.fill();
      ctx.fillStyle = '#5a3a1e';
      ctx.fillRect(528 + i * 80, 50, 28, 8);
    });
  }

  function drawHeader(state, best) {
    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(0, 0, VIEW_W, 64);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍳 Sizzle & Serve', 24, 33);
    // The shift timer, big in the middle, with a draining bar beneath it.
    const urgent = state.timeLeft <= 30;
    ctx.fillStyle = urgent ? '#ff6b6b' : '#ffffff';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⏱ ${clock(state.timeLeft)}`, VIEW_W / 2, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, VIEW_W / 2 - 130, 50, 260, 7, 3);
    ctx.fill();
    ctx.fillStyle = urgent ? '#ff6b6b' : '#7cc24a';
    roundRect(ctx, VIEW_W / 2 - 130, 50, 260 * (state.timeLeft / 150), 7, 3);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText(`Score ${state.score}`, VIEW_W - 200, 26);
    ctx.font = '16px Georgia, serif';
    ctx.fillStyle = '#ffd166';
    ctx.fillText(`Best ${best}  •  Served ${state.served}`, VIEW_W - 200, 48);
    // Missed orders as three small hearts at the right edge.
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < 3 - state.missed ? '#ff6b6b' : 'rgba(255,255,255,0.25)';
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥', VIEW_W - 168 + i * 30, 33);
    }
  }

  function drawOrderBoard(state, now) {
    shadow(ctx, 24, 84, 420, 296, 16);
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, 24, 84, 420, 296, 16);
    ctx.fill();
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('📋 ORDER BOARD', 44, 114);
    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = '#8a6d4b';
    ctx.fillText('Serve each dish before its timer runs out!', 44, 136);
    if (state.orders.length === 0) {
      ctx.fillStyle = '#8a6d4b';
      ctx.font = 'italic 18px Georgia, serif';
      ctx.fillText('No orders yet — the rush is coming…', 44, 220);
      return;
    }
    state.orders.forEach((order, index) => {
      const y = 148 + index * 76;
      const urgent = order.timeLeft <= 10;
      const pulse = urgent && Math.floor(now / 300) % 2 === 0;
      ctx.fillStyle = pulse ? '#ffe0e0' : '#ffffff';
      roundRect(ctx, 40, y, 388, 66, 10);
      ctx.fill();
      ctx.strokeStyle = urgent ? '#e5484d' : '#e0c9a0';
      ctx.lineWidth = urgent ? 3 : 1.5;
      roundRect(ctx, 40, y, 388, 66, 10);
      ctx.stroke();
      ctx.fillStyle = '#3d2b1f';
      ctx.font = 'bold 18px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(`#${order.id} ${order.name}`, 56, y + 22);
      order.needs.forEach((id, i) => drawIngredient(ctx, id, 70 + i * 34, y + 48, 12));
      // The ticket's countdown bar and seconds.
      const frac = Math.max(0, order.timeLeft / order.total);
      ctx.fillStyle = '#eee0c8';
      roundRect(ctx, 210, y + 40, 150, 12, 6);
      ctx.fill();
      ctx.fillStyle = frac > 0.5 ? '#7cc24a' : frac > 0.25 ? '#f2a541' : '#e5484d';
      roundRect(ctx, 210, y + 40, 150 * frac, 12, 6);
      ctx.fill();
      ctx.fillStyle = urgent ? '#e5484d' : '#3d2b1f';
      ctx.font = 'bold 18px Georgia, serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.ceil(order.timeLeft)}s`, 412, y + 50);
    });
  }

  function drawStove() {
    shadow(ctx, 472, 84, 400, 296, 16);
    ctx.fillStyle = '#6b4a2f';
    roundRect(ctx, 472, 84, 400, 296, 16);
    ctx.fill();
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('🔥 STOVE', 492, 112);
    // Two burners with a steaming pot and a sizzling pan.
    for (const cx of [580, 760]) {
      ctx.fillStyle = '#22201e';
      ctx.beginPath();
      ctx.ellipse(cx, 300, 78, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#55504a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, 300, 60, 14, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Pot with rising steam.
    ctx.fillStyle = '#9aa5ad';
    roundRect(ctx, 520, 226, 120, 66, 10);
    ctx.fill();
    ctx.fillStyle = '#7c8790';
    ctx.fillRect(512, 236, 12, 8);
    ctx.fillRect(636, 236, 12, 8);
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.ellipse(580, 228, 52, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const x = 552 + i * 28;
      ctx.beginPath();
      ctx.moveTo(x, 210);
      ctx.quadraticCurveTo(x + 10, 190, x, 170);
      ctx.quadraticCurveTo(x - 10, 150, x, 132);
      ctx.stroke();
    }
    // Frying pan with a sunny-side egg.
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.ellipse(760, 288, 74, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(828, 282, 44, 10);
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath();
    ctx.ellipse(760, 282, 44, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.arc(760, 280, 11, 0, Math.PI * 2);
    ctx.fill();
    // Hanging pans on the wall above the stove.
    ctx.strokeStyle = '#5a3a1e';
    ctx.lineWidth = 4;
    for (const x of [520, 600, 680, 760, 830]) {
      ctx.beginPath();
      ctx.arc(x, 160, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, 138);
      ctx.lineTo(x, 118);
      ctx.stroke();
    }
  }

  function drawPlate(state, match, now) {
    shadow(ctx, PLATE.x, PLATE.y, PLATE.w, PLATE.h, 16);
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, PLATE.x, PLATE.y, PLATE.w, PLATE.h, 16);
    ctx.fill();
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'left';
    if (match) {
      ctx.fillStyle = '#2e7d32';
      ctx.font = 'bold 17px Georgia, serif';
      ctx.fillText(`✓ Matches ${match.name} — serve it!`, PLATE.x + 16, PLATE.y + 26);
    } else {
      ctx.fillText('🍽 YOUR PLATE', PLATE.x + 16, PLATE.y + 26);
    }
    // The plate itself: a white ellipse with a grey rim.
    const cx = PLATE.x + 120;
    const cy = PLATE.y + 96;
    ctx.fillStyle = '#d8d2c8';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 92, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 82, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    if (state.plate.length === 0) {
      ctx.fillStyle = '#b8a88e';
      ctx.font = 'italic 15px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('empty — tap ingredients', cx, cy + 5);
    } else {
      // Stack the ingredients on the plate, newest on top.
      state.plate.forEach((id, i) => {
        const y = cy - 8 - i * 13;
        drawIngredient(ctx, id, cx, Math.max(y, cy - 58), 20);
      });
    }
    // What is on the plate, as a readable list.
    ctx.textAlign = 'left';
    ctx.font = '15px Georgia, serif';
    ctx.fillStyle = '#6b543a';
    const list = state.plate.map((id) => ingredientById(id).label).join(' + ') || '—';
    ctx.fillText(list, PLATE.x + 16, PLATE.y + 146, PLATE.w - 32);
  }

  function drawServeButton(state, match, hover) {
    const ready = match !== null;
    const hot = hover && hover.x >= SERVE.x && hover.x <= SERVE.x + SERVE.w && hover.y >= SERVE.y && hover.y <= SERVE.y + SERVE.h;
    shadow(ctx, SERVE.x, SERVE.y, SERVE.w, SERVE.h, 16);
    ctx.fillStyle = ready ? (hot ? '#5cb85c' : '#4caf50') : '#c9bda6';
    roundRect(ctx, SERVE.x, SERVE.y, SERVE.w, SERVE.h, 16);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SERVE!', SERVE.x + SERVE.w / 2, SERVE.y + 42);
    ctx.font = '16px Georgia, serif';
    ctx.fillText(ready ? 'Enter / S' : 'build a dish first', SERVE.x + SERVE.w / 2, SERVE.y + 72);
    if (ready) {
      ctx.fillStyle = '#2e7d32';
      ctx.font = 'bold 16px Georgia, serif';
      ctx.fillText(`+${SERVE_POINTS} pts`, SERVE.x + SERVE.w / 2, SERVE.y - 12);
    }
  }

  function drawCounter(state, hover) {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(0, BINS_Y - 16, VIEW_W, BINS_H + 40);
    ctx.fillStyle = '#6b4423';
    ctx.fillRect(0, BINS_Y - 16, VIEW_W, 8);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('🥘 INGREDIENT COUNTER', 24, BINS_Y - 26);
    ctx.textAlign = 'right';
    ctx.font = '16px Georgia, serif';
    ctx.fillText('click a bin or press its key  •  click the plate to take one off', VIEW_W - 24, BINS_Y - 26);
    for (const bin of binZones()) {
      const item = ingredientById(bin.id);
      const hot = hover && hover.x >= bin.x && hover.x <= bin.x + bin.w && hover.y >= bin.y && hover.y <= bin.y + bin.h;
      shadow(ctx, bin.x, bin.y, bin.w, bin.h, 12);
      ctx.fillStyle = hot ? '#fff3d6' : '#fff8e6';
      roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 12);
      ctx.fill();
      drawIngredient(ctx, bin.id, bin.x + bin.w / 2, bin.y + 46, 26);
      ctx.fillStyle = '#3d2b1f';
      ctx.font = 'bold 17px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, bin.x + bin.w / 2, bin.y + 90);
      ctx.fillStyle = '#8a6d4b';
      ctx.font = '13px Georgia, serif';
      ctx.fillText(`key ${item.key}`, bin.x + bin.w / 2, bin.y + 106);
    }
  }

  function drawBanner(banner) {
    if (!banner) return;
    ctx.font = 'bold 34px Georgia, serif';
    const w = ctx.measureText(banner.text).width + 48;
    shadow(ctx, VIEW_W / 2 - w / 2, 150, w, 62, 14);
    ctx.fillStyle = banner.color;
    roundRect(ctx, VIEW_W / 2 - w / 2, 150, w, 62, 14);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(banner.text, VIEW_W / 2, 190);
  }

  function drawTitle(state, best) {
    drawWall();
    drawOrderBoard(state, 0);
    drawStove();
    drawPlate(state, null, 0);
    drawServeButton(state, null, null);
    drawCounter(state, null);
    ctx.fillStyle = 'rgba(30,18,8,0.55)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, 240, 120, 800, 460, 20);
    ctx.fill();
    ctx.fillStyle = '#e5484d';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('🍳 Sizzle & Serve', VIEW_W / 2, 210);
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('The rush-hour kitchen game', VIEW_W / 2, 252);
    ctx.font = '18px Georgia, serif';
    const lines = [
      'Orders land on the board — each one lists the ingredients it needs.',
      'Click the bins (or press 1–7) to stack them on your plate.',
      'When the plate matches an order, hit SERVE before its timer runs out.',
      'Serve fast for bonus points. Three missed orders end the shift!',
    ];
    lines.forEach((line, i) => ctx.fillText(line, VIEW_W / 2, 306 + i * 32));
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillStyle = '#2e7d32';
    ctx.fillText('Press SPACE or click to start cooking', VIEW_W / 2, 470);
    ctx.font = '16px Georgia, serif';
    ctx.fillStyle = '#8a6d4b';
    ctx.fillText(`Best score ${best}  •  P pauses  •  Backspace removes an ingredient  •  M mutes`, VIEW_W / 2, 512);
    ctx.fillText('A complete original game — no two shifts play the same.', VIEW_W / 2, 542);
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(30,18,8,0.6)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, 440, 280, 400, 160, 18);
    ctx.fill();
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', VIEW_W / 2, 340);
    ctx.font = '18px Georgia, serif';
    ctx.fillText('Press P or click to keep cooking', VIEW_W / 2, 388);
  }

  function drawOver(state, best) {
    drawWall();
    drawOrderBoard(state, 0);
    drawStove();
    drawPlate(state, null, 0);
    drawServeButton(state, null, null);
    drawCounter(state, null);
    ctx.fillStyle = 'rgba(30,18,8,0.6)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, 290, 130, 700, 450, 20);
    ctx.fill();
    ctx.fillStyle = state.won ? '#2e7d32' : '#e5484d';
    ctx.font = 'bold 52px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.won ? '🎉 Shift Complete!' : '😮 Shift Over!', VIEW_W / 2, 210);
    const stars = '★'.repeat(state.served >= 12 ? 3 : state.served >= 8 ? 2 : state.served >= 4 ? 1 : 0);
    ctx.fillStyle = '#f2a541';
    ctx.font = '44px Georgia, serif';
    ctx.fillText(stars || '—', VIEW_W / 2, 268);
    ctx.fillStyle = '#3d2b1f';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText(`Dishes served: ${state.served}   •   Missed: ${state.missed}`, VIEW_W / 2, 322);
    ctx.fillText(`Final score: ${state.score}`, VIEW_W / 2, 362);
    ctx.font = '18px Georgia, serif';
    ctx.fillStyle = '#8a6d4b';
    ctx.fillText(`Best score: ${best}`, VIEW_W / 2, 402);
    ctx.fillText(state.won ? 'The customers loved your cooking!' : 'Three orders walked out — the rush got you.', VIEW_W / 2, 436);
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillStyle = '#2e7d32';
    ctx.fillText('Press SPACE or click to cook another shift', VIEW_W / 2, 500);
  }

  return {
    /** The click zones: ingredient bins, the plate and the serve button. */
    layout() {
      return { bins: binZones(), plate: PLATE, serve: SERVE };
    },
    /**
     * Paints one frame.
     * @param {object} state the world's state
     * @param {string} screen one of the SCREEN_* constants
     * @param {number} best the best score so far
     * @param {{ hover: {x:number,y:number}|null, banner: {text:string,color:string}|null, match: object|null, now: number }} extra
     */
    draw(state, screen, best, extra) {
      const { hover, banner, match, now } = extra;
      if (screen === SCREEN_TITLE) {
        drawTitle(state, best);
        return;
      }
      if (screen === SCREEN_OVER) {
        drawOver(state, best);
        return;
      }
      drawWall();
      drawHeader(state, best);
      drawOrderBoard(state, now);
      drawStove();
      drawPlate(state, match, now);
      drawServeButton(state, match, hover);
      drawCounter(state, hover);
      drawBanner(banner);
      if (screen === SCREEN_PAUSED) drawPaused();
    },
  };
}
