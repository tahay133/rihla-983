// WebAudio chiptune + sound effects, all synthesised. The AudioContext is only created
// on the first user input (browsers block autoplay, and the handoff asks for it).
const SCALES = {
  // semitone offsets from the tonic (12-TET approximations of maqam colours)
  rast: [0, 2, 4, 5, 7, 9, 10, 12],      // Bukhara
  bayati: [0, 1, 3, 5, 7, 8, 10, 12],    // Baghdad
  hijaz: [0, 1, 4, 5, 7, 8, 10, 12],     // Cairo
  nahawand: [0, 2, 3, 5, 7, 8, 11, 12],  // Qayrawan
  kurd: [0, 1, 3, 5, 7, 8, 10, 12],      // Córdoba
};
const _ = -1;
const SONGS = {
  title: { bpm: 76, root: 50, scale: 'nahawand', wave: 'triangle', drums: false,
    mel: [0, _, _, _, 2, _, 4, _, 3, _, 2, _, _, _, _, _, 4, _, 5, _, 4, _, 2, _, 1, _, _, _, 0, _, _, _] },
  map: { bpm: 88, root: 50, scale: 'rast', wave: 'triangle', drums: 'light',
    mel: [0, _, 2, _, 4, _, 2, _, 3, _, 4, _, 2, _, _, _, 1, _, 2, _, 0, _, 1, _, 0, _, _, _, _, _, _, _] },
  bukhara: { bpm: 96, root: 50, scale: 'rast', wave: 'square',
    mel: [0, _, 2, _, 4, _, 3, 2, 1, _, 0, _, 1, 2, _, _, 4, _, 5, 4, 3, _, 2, _, 1, 2, 1, 0, _, _, _, _] },
  baghdad: { bpm: 104, root: 50, scale: 'bayati', wave: 'square',
    mel: [4, _, 3, 2, 1, _, 2, _, 3, _, 2, 1, 0, _, _, _, 0, 1, 2, _, 3, _, 4, _, 5, 4, 3, 2, 1, _, 0, _] },
  cairo: { bpm: 112, root: 50, scale: 'hijaz', wave: 'square',
    mel: [0, 1, 2, _, 1, 0, _, _, 2, 3, 4, _, 3, 2, 1, _, 4, _, 5, _, 4, 3, 2, 1, 2, 1, 0, _, 0, _, _, _] },
  qayrawan: { bpm: 72, root: 50, scale: 'nahawand', wave: 'triangle', drums: 'light',
    mel: [0, _, _, _, 2, _, _, _, 4, _, 3, _, 2, _, _, _, 1, _, _, _, 2, _, 1, _, 0, _, _, _, _, _, _, _] },
  cordoba: { bpm: 100, root: 50, scale: 'kurd', wave: 'square',
    mel: [4, _, 4, 3, 1, _, 0, _, 1, _, 3, _, 4, 5, 4, _, 3, _, 1, _, 0, _, 1, 3, 1, _, 0, _, _, _, _, _] },
  vitrine: { bpm: 70, root: 50, scale: 'rast', wave: 'triangle', drums: false,
    mel: [0, _, 2, _, 4, _, 7, _, 5, _, 4, _, 2, _, _, _, 3, _, 4, _, 2, _, 1, _, 0, _, _, _, _, _, _, _] },
};
// maqsum-like 8-step pattern: D = dum (low), T = tek (high)
const MAQSUM = ['D', _, 'T', _, _, 'T', 'D', 'T'];

const midi = n => 440 * Math.pow(2, (n - 69) / 12);

export function createAudio() {
  let ac = null, master = null, musicBus = null, sfxBus = null, noiseBuf = null;
  let muted = false, want = null, playing = null, step = 0, nextT = 0, timer = null;

  function init() {
    if (ac) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { ac = new AC(); } catch (e) { return false; }
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.55; master.connect(ac.destination);
    musicBus = ac.createGain(); musicBus.gain.value = 0.3; musicBus.connect(master);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.6; sfxBus.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function tone(freq, t0, dur, o = {}) {
    const osc = ac.createOscillator(), g = ac.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    const v = o.vol ?? 0.2;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(o.bus || sfxBus);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function noise(t0, dur, o = {}) {
    const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = noiseBuf;
    f.type = o.filter || 'lowpass'; f.frequency.value = o.freq || 1200;
    g.gain.setValueAtTime(o.vol ?? 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f); f.connect(g); g.connect(o.bus || sfxBus);
    src.start(t0); src.stop(t0 + dur + 0.02);
  }

  const SFX = {
    jump: t => tone(330, t, 0.11, { to: 660, vol: 0.12 }),
    land: t => noise(t, 0.06, { freq: 500, vol: 0.12 }),
    bounce: t => tone(220, t, 0.18, { type: 'triangle', to: 880, vol: 0.22 }),
    swim: t => noise(t, 0.12, { freq: 900, vol: 0.08 }),
    splash: t => { noise(t, 0.3, { freq: 1600, vol: 0.18 }); tone(180, t, 0.15, { type: 'sine', to: 90, vol: 0.1 }); },
    hurt: t => { tone(260, t, 0.18, { to: 110, vol: 0.18 }); noise(t, 0.12, { freq: 2000, vol: 0.1 }); },
    checkpoint: t => { tone(523, t, 0.12, { type: 'triangle', vol: 0.2 }); tone(784, t + 0.1, 0.2, { type: 'triangle', vol: 0.2 }); },
    pickup: t => [72, 76, 79, 84, 88].forEach((n, i) => tone(midi(n), t + i * 0.07, 0.25, { type: 'triangle', vol: 0.22 })),
    card: t => { tone(440, t, 0.4, { type: 'sine', to: 660, vol: 0.12 }); tone(midi(81), t + 0.12, 0.5, { type: 'sine', vol: 0.08 }); },
    gate: t => { tone(98, t, 0.6, { type: 'triangle', to: 147, vol: 0.25 }); noise(t, 0.5, { freq: 300, vol: 0.12 }); },
    deny: t => { tone(220, t, 0.12, { vol: 0.12 }); tone(196, t + 0.13, 0.18, { vol: 0.12 }); },
    roll: t => noise(t, 0.05, { freq: 400, vol: 0.06 }),
    splat: t => noise(t, 0.12, { freq: 900, vol: 0.12 }),
    crack: t => noise(t, 0.05, { filter: 'highpass', freq: 2500, vol: 0.1 }),
    alarm: t => [0, 1, 2].forEach(i => { tone(660, t + i * 0.22, 0.1, { vol: 0.12 }); tone(880, t + i * 0.22 + 0.11, 0.1, { vol: 0.12 }); }),
    tick: t => tone(1200, t, 0.03, { vol: 0.06 }),
    select: t => tone(880, t, 0.06, { type: 'triangle', vol: 0.12 }),
  };

  function sfx(name) {
    if (!ac || muted || !SFX[name]) return;
    SFX[name](ac.currentTime + 0.005);
  }

  function schedule() {
    const song = SONGS[playing];
    if (!song) return;
    const sp = 60 / song.bpm / 2; // eighth notes
    const sc = SCALES[song.scale];
    while (nextT < ac.currentTime + 0.15) {
      const i = step % song.mel.length;
      const deg = song.mel[i];
      if (deg !== _) {
        const n = song.root + 12 + sc[deg % 8] + (deg >= 8 ? 12 : 0);
        tone(midi(n), nextT, sp * 1.6, { type: song.wave, vol: song.wave === 'triangle' ? 0.22 : 0.09, bus: musicBus, attack: 0.01 });
      }
      if (i % 8 === 0) tone(midi(song.root - 12), nextT, sp * 7.5, { type: 'triangle', vol: 0.16, bus: musicBus, attack: 0.05 });
      if (i % 16 === 8) tone(midi(song.root - 5), nextT, sp * 7.5, { type: 'triangle', vol: 0.1, bus: musicBus, attack: 0.05 });
      if (song.drums !== false) {
        const hit = MAQSUM[i % 8];
        const soft = song.drums === 'light' ? 0.5 : 1;
        if (hit === 'D') tone(80, nextT, 0.16, { type: 'sine', to: 45, vol: 0.35 * soft, bus: musicBus });
        if (hit === 'T') noise(nextT, 0.05, { filter: 'highpass', freq: 3000, vol: 0.12 * soft, bus: musicBus });
      }
      nextT += sp;
      step++;
    }
  }

  function startSong(name) {
    if (!ac || playing === name) return;
    playing = name;
    step = 0;
    nextT = ac.currentTime + 0.08;
    if (!timer) timer = setInterval(() => { if (ac && ac.state === 'running') schedule(); }, 25);
  }

  return {
    // Called from the first keydown/pointerdown handler, so it counts as a user gesture.
    unlock() {
      if (!init()) return;
      if (ac.state === 'suspended') ac.resume();
      if (want) startSong(want);
    },
    get started() { return !!ac; },
    sfx,
    music(name) { want = name; if (ac) startSong(name); },
    setMuted(m) {
      muted = m;
      if (master) master.gain.setTargetAtTime(m ? 0 : 0.55, ac.currentTime, 0.02);
    },
  };
}
