// Fixed 60 Hz update with an accumulator; render on requestAnimationFrame.
export const STEP_MS = 1000 / 60;

export function startLoop(update, render) {
  const stats = { fps: 60, ups: 60, frame: 0 };
  let acc = 0, last = performance.now();
  let fCount = 0, uCount = 0, statT = last;

  function frame(now) {
    let dt = now - last;
    last = now;
    if (dt > 250) dt = STEP_MS;                       // tab was hidden: don't fast-forward
    if (Math.abs(dt - STEP_MS) < 0.75) dt = STEP_MS;  // snap vsync jitter on 60 Hz displays
    acc += dt;
    let steps = 0;
    while (acc >= STEP_MS && steps < 5) {
      update();
      acc -= STEP_MS;
      steps++;
      uCount++;
      stats.frame++;
    }
    if (steps === 5) acc = 0;
    render(acc / STEP_MS);
    fCount++;
    if (now - statT >= 1000) {
      stats.fps = Math.round((fCount * 1000) / (now - statT));
      stats.ups = Math.round((uCount * 1000) / (now - statT));
      fCount = uCount = 0;
      statT = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  return stats;
}
