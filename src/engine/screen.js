// Pixel-perfect screen: a 320×180 canvas scaled by the largest integer number of
// *device* pixels that fits the window, letterboxed in black.
export const W = 320, H = 180;

export function createScreen(canvas, wrap) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const screen = { canvas, ctx, wrap, scale: 1, cssScale: 1, listeners: [] };

  function fit() {
    const dpr = window.devicePixelRatio || 1;
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = document.documentElement.clientHeight || window.innerHeight;
    const s = Math.max(1, Math.floor(Math.min((vw * dpr) / W, (vh * dpr) / H)));
    screen.scale = s;
    screen.cssScale = s / dpr;
    const cw = (W * s) / dpr, ch = (H * s) / dpr;
    wrap.style.width = cw + 'px';
    wrap.style.height = ch + 'px';
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    document.documentElement.style.setProperty('--k', String(screen.cssScale));
    ctx.imageSmoothingEnabled = false;
    for (const fn of screen.listeners) fn(screen);
  }

  window.addEventListener('resize', fit);
  // devicePixelRatio changes (browser zoom, moving between monitors) don't always fire resize.
  let mq = null;
  function watchDpr() {
    if (mq) mq.removeEventListener('change', onDpr);
    mq = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    mq.addEventListener('change', onDpr);
  }
  function onDpr() { fit(); watchDpr(); }
  watchDpr();
  fit();

  screen.fit = fit;
  screen.onResize = fn => screen.listeners.push(fn);
  return screen;
}
