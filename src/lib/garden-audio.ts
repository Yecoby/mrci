/**
 * Generative ambient synthesizer — pentatonic chimes + a soft pad.
 * No external audio file required. Pure Web Audio API.
 */

type GardenAudio = {
  start: () => Promise<void>;
  stop: () => void;
  toggle: () => Promise<boolean>;
  isPlaying: () => boolean;
};

export function createGardenAudio(externalAudioUrl?: string): GardenAudio {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let mediaElement: HTMLAudioElement | null = null;
  let nodes: AudioNode[] = [];
  let timers: number[] = [];
  let playing = false;

  const notes = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

  function clear() {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    nodes.forEach((n) => {
      try {
        (n as OscillatorNode).stop?.();
      } catch {
        // already stopped
      }
    });
    nodes = [];
  }

  function chime(freq: number, when: number, dur = 2.4) {
    if (!ctx || !master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, when);

    gain.gain.setValueAtTime(0, when);
    gain.gain.linearRampToValueAtTime(0.045, when + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    osc.connect(gain);
    gain.connect(master);
    osc.start(when);
    osc.stop(when + dur + 0.1);
    nodes.push(osc, gain);
  }

  function loop() {
    if (!playing || !ctx) return;
    const now = ctx.currentTime;
    const pick = notes[Math.floor(Math.random() * notes.length)];
    chime(pick, now + 0.05, 3.2);

    if (Math.random() > 0.4) {
      const second = notes[Math.floor(Math.random() * notes.length)];
      chime(second, now + 0.45, 2.6);
    }

    const nextDelay = 1800 + Math.random() * 2200;
    const t = window.setTimeout(loop, nextDelay);
    timers.push(t);
  }

  return {
    async start() {
      if (playing) return;
      if (externalAudioUrl) {
        try {
          if (!mediaElement) {
            mediaElement = new Audio(externalAudioUrl);
            mediaElement.loop = true;
          }
          await mediaElement.play();
          playing = true;
          return;
        } catch {
          // Fall back to synth
        }
      }

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.setValueAtTime(0.7, ctx.currentTime);
      master.connect(ctx.destination);
      playing = true;
      loop();
    },
    stop() {
      if (mediaElement) {
        mediaElement.pause();
        mediaElement.currentTime = 0;
      }
      clear();
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
      }
      playing = false;
    },
    async toggle() {
      if (playing) {
        this.stop();
        return false;
      }
      await this.start();
      return playing;
    },
    isPlaying() {
      return playing;
    },
  };
}
