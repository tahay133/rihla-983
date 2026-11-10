// Integer camera with a deadzone, clamped to the map. Everything is whole pixels,
// so sprites never jitter against the background while scrolling.
import { W, H } from './screen.js';

export function createCamera(mapW, mapH) {
  return { x: 0, y: 0, mapW, mapH };
}

export function clampCamera(cam) {
  cam.x = cam.mapW <= W ? Math.round((cam.mapW - W) / 2) : Math.max(0, Math.min(cam.mapW - W, cam.x));
  cam.y = cam.mapH <= H ? Math.round((cam.mapH - H) / 2) : Math.max(0, Math.min(cam.mapH - H, cam.y));
}

// Follow a body (x, y, w, h). The deadzone is in screen pixels.
export function followCamera(cam, b, grounded, snap = false) {
  const px = Math.round(b.x + b.w / 2), feet = Math.round(b.y + b.h);
  if (snap) {
    cam.x = px - W / 2; cam.y = feet - 124;
  } else {
    const sx = px - cam.x;
    if (sx < 136) cam.x = px - 136; else if (sx > 176) cam.x = px - 176;
    const sy = feet - cam.y;
    if (sy < 60) cam.y = feet - 60;
    else if (sy > 150) cam.y = feet - 150;
    else if (grounded) cam.y += Math.max(-2, Math.min(2, feet - 124 - cam.y));
  }
  clampCamera(cam);
}
