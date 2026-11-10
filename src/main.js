// Riḥla 983 — boot.
const W = 320, H = 180;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

ctx.fillStyle = '#000';
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = '#f3ead2';
ctx.font = '16px monospace';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Riḥla 983', W / 2, H / 2);

// Temporary fixed ×3 CSS scale until the engine screen module lands.
canvas.style.width = W * 3 + 'px';
canvas.style.height = H * 3 + 'px';
