// Every sound in the game, synthesized live with WebAudio: no audio files, no network.
// Short oscillator blips with a quick decay, mixed through one gain node so a mute
// toggle can silence the whole kitchen at once.

/** The note table for the little jingles, in hertz. */
const NOTES = {
  pop: 520,
  ding: 880,
  buzz: 140,
  tick: 1200,
  win: [523, 659, 784, 1047],
  lose: [392, 330, 262],
};

/**
 * Creates the sound board. It starts silent until the player interacts (browsers
 * require a gesture before audio may play), and every call is safe before that.
 */
export function createSoundBoard() {
  let context = null;
  let master = null;
  let muted = false;

  function ensureContext() {
    if (context) return true;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 0.35;
      master.connect(context.destination);
      return true;
    } catch {
      return false;
    }
  }

  /** One short tone: a sine blip that fades out over `length` seconds. */
  function tone(freq, length, when = 0, type = 'sine') {
    if (muted || !ensureContext()) return;
    if (context.state === 'suspended') void context.resume();
    const start = context.currentTime + when;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.5, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + length + 0.05);
  }

  return {
    /** Unlocks audio; call from the first click or key press. */
    unlock() {
      ensureContext();
      if (context && context.state === 'suspended') void context.resume();
    },
    /** Flips the mute switch and reports the new state. */
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    /** A soft pop when an ingredient lands on the plate. */
    pop() {
      tone(NOTES.pop, 0.09, 0, 'triangle');
    },
    /** A bright two-note chime when a dish is served. */
    serve() {
      tone(NOTES.ding, 0.12);
      tone(NOTES.ding * 1.5, 0.18, 0.09);
    },
    /** A low buzz when the plate cannot be served yet. */
    buzz() {
      tone(NOTES.buzz, 0.18, 0, 'sawtooth');
    },
    /** A sharp tick when an order is about to expire. */
    tick() {
      tone(NOTES.tick, 0.05, 0, 'square');
    },
    /** The end-of-shift fanfare, or the flat notes of a failed shift. */
    fanfare(won) {
      const notes = won ? NOTES.win : NOTES.lose;
      notes.forEach((freq, index) => tone(freq, 0.22, index * 0.13, 'triangle'));
    },
  };
}
