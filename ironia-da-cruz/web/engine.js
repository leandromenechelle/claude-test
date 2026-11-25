// ===== Núcleo: matemática, easing, tempo, ruído, luz, partículas, texto =====
const W = 1080, H = 1920;
const TAU = Math.PI * 2;

const C = {
  ink: '#04060a', night: '#0a1222', deep: '#070b14', steel: '#8ea4bd', silver: '#dfe7f1',
  cold: '#a9c8ff', ice: '#d8e8ff', amber: '#f4a340', ember: '#ff7a2a', blood: '#d0402f',
  bone: '#efe6d6', gold: '#ffd38a', robe: '#0b0f16', robe2: '#121823', wall: '#2a1a10'
};

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const smooth = t => t * t * (3 - 2 * t);
const E = {
  lin: t => t,
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  out5: t => 1 - Math.pow(1 - t, 5),
  expo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
};
// 0→1 entre a e b com easing
const tw = (t, a, b, e = E.inOut) => e(inv(a, b, t));
// janela: sobe em [a,a+fi], desce em [b-fo,b]
const win = (t, a, b, fi = .4, fo = .4) => Math.min(tw(t, a, a + fi, E.out), 1 - tw(t, b - fo, b, E.in));

function hash(n) { n = Math.floor(n) | 0; n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = Math.imul(n ^ (n >>> 16), 0x45d9f3b); n = n ^ (n >>> 16); return (n >>> 0) / 4294967296 * 2 - 1; }
const rnd = (i, s = 0) => (hash(i * 9973 + s * 7919 + 17) + 1) / 2; // [0,1)
function noise1(x, s = 0) { const i = Math.floor(x), f = x - i; return lerp(rnd(i, s), rnd(i + 1, s), smooth(f)) * 2 - 1; }
function fbm(x, s = 0) { return noise1(x, s) * .6 + noise1(x * 2.13, s + 3) * .3 + noise1(x * 4.7, s + 7) * .1; }

// ---------- tempo da narração ----------
const TM = window.TIMING;
const SEN = {}; TM.sentences.forEach(s => SEN[s.id] = s);
const normW = w => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
// tempo de uma palavra dentro de uma frase (needle = início da palavra, sem acento)
function wt(sid, needle, occ = 0) {
  const n = normW(needle); let k = 0;
  for (const w of TM.words) if (w.sid === sid && normW(w.w).startsWith(n)) { if (k++ === occ) return w; }
  console.warn('word not found', sid, needle); return { s: SEN[sid].start, e: SEN[sid].end };
}
const ws = (sid, needle, occ) => wt(sid, needle, occ).s;
const we = (sid, needle, occ) => wt(sid, needle, occ).e;
const sentWords = sid => TM.words.filter(w => w.sid === sid);

// ---------- desenho básico ----------
function vgrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([o, c]) => g.addColorStop(o, c)); return g;
}
function fillBg(ctx, stops) { ctx.fillStyle = vgrad(ctx, 0, H, stops); ctx.fillRect(0, 0, W, H); }
function rgba(hex, a) {
  const h = hex.replace('#', ''); const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function glow(ctx, x, y, r, color, a = 1, inner = 0) {
  if (a <= 0 || r <= 0) return;
  const g = ctx.createRadialGradient(x, y, r * inner, x, y, r);
  g.addColorStop(0, rgba(color, a)); g.addColorStop(.35, rgba(color, a * .45));
  g.addColorStop(.7, rgba(color, a * .12)); g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
// cone de luz de cima (luz fria/quente)
function lightCone(ctx, x, y, topW, botW, len, color, a, seed = 0, t = 0) {
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const g = ctx.createLinearGradient(0, y, 0, y + len);
  g.addColorStop(0, rgba(color, a)); g.addColorStop(.6, rgba(color, a * .35)); g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - topW / 2, y); ctx.lineTo(x + topW / 2, y);
  ctx.lineTo(x + botW / 2, y + len); ctx.lineTo(x - botW / 2, y + len); ctx.closePath(); ctx.fill();
  // estrias
  for (let i = 0; i < 7; i++) {
    const u = rnd(i, seed) - .5, w = 6 + rnd(i, seed + 1) * 26;
    const fl = .5 + .5 * noise1(t * .4 + i * 3.1, seed);
    ctx.globalAlpha = .35 * fl;
    ctx.beginPath();
    ctx.moveTo(x + u * topW - w * .2, y); ctx.lineTo(x + u * topW + w * .2, y);
    ctx.lineTo(x + u * botW + w, y + len); ctx.lineTo(x + u * botW - w, y + len); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
// poeira flutuante determinística
function dust(ctx, t, n, seed, box, color = C.ice, size = 2.2, alpha = .5, speed = 12) {
  const [bx, by, bw, bh] = box;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const r1 = rnd(i, seed), r2 = rnd(i, seed + 1), r3 = rnd(i, seed + 2), r4 = rnd(i, seed + 3);
    let x = bx + ((r1 * bw + noise1(t * .15 + i, seed) * 40) % bw + bw) % bw;
    let y = by + (((r2 * bh - t * speed * (.4 + r3)) % bh) + bh) % bh;
    const tw_ = .35 + .65 * Math.abs(noise1(t * .7 + i * 1.7, seed + 5));
    const s = size * (.4 + r4 * 1.2);
    ctx.globalAlpha = alpha * tw_;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
// estrelas
function stars(ctx, t, n, seed, y0, y1, a = .8) {
  ctx.save(); ctx.fillStyle = '#fff';
  for (let i = 0; i < n; i++) {
    const x = rnd(i, seed) * W, y = lerp(y0, y1, Math.pow(rnd(i, seed + 1), 1.4));
    const s = .6 + rnd(i, seed + 2) * 1.6;
    ctx.globalAlpha = a * (.3 + .7 * Math.abs(noise1(t * .5 + i, seed + 9)));
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

// ---------- texto ----------
const F = {
  disp: s => `${s}px Anton`,
  serif: (s, w = 600) => `italic ${w} ${s}px "Cormorant Garamond"`,
  serifN: (s, w = 600) => `${w} ${s}px "Cormorant Garamond"`,
  sans: (s, w = 800) => `${w} ${s}px Inter`,
};
function text(ctx, str, x, y, font, color, opts = {}) {
  ctx.save();
  ctx.font = font; ctx.fillStyle = color;
  ctx.textAlign = opts.align || 'center'; ctx.textBaseline = opts.base || 'middle';
  ctx.letterSpacing = (opts.ls || 0) + 'px';
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  if (opts.shadow) { ctx.shadowColor = opts.shadow; ctx.shadowBlur = opts.blur || 30; }
  if (opts.stroke) { ctx.lineWidth = opts.strokeW || 8; ctx.strokeStyle = opts.stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  ctx.fillText(str, x, y);
  ctx.restore();
}
function measure(ctx, str, font, ls = 0) { ctx.save(); ctx.font = font; ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(str).width; ctx.restore(); return w; }

// Referência bíblica elegante: ── JOÃO 6:64 ── (linhas finas desenhadas, sem caracteres de travessão)
function refTag(ctx, str, x, y, a, opts = {}) {
  if (a <= 0) return;
  const size = opts.size || 46;
  const col = opts.color || C.silver;
  ctx.save(); ctx.globalAlpha = a;
  const yy = y + (1 - a) * 14;
  const w = measure(ctx, str, F.serifN(size, 600), 3);
  text(ctx, str, x, yy, F.serifN(size, 600), col, { ls: 3, shadow: 'rgba(0,0,0,.8)', blur: 18 });
  const lw = 70 * a;
  ctx.strokeStyle = rgba(opts.line || C.amber, .9); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - w / 2 - 22, yy); ctx.lineTo(x - w / 2 - 22 - lw, yy);
  ctx.moveTo(x + w / 2 + 22, yy); ctx.lineTo(x + w / 2 + 22 + lw, yy); ctx.stroke();
  ctx.fillStyle = rgba(opts.line || C.amber, .9);
  [[x - w / 2 - 22 - lw, yy], [x + w / 2 + 22 + lw, yy]].forEach(([px, py]) => { ctx.beginPath(); ctx.arc(px, py, 3.5, 0, TAU); ctx.fill(); });
  ctx.restore();
}
// rótulo pequeno em caixa alta espaçada
function label(ctx, str, x, y, a, color = C.steel, size = 30, ls = 8) {
  if (a <= 0) return;
  text(ctx, str, x, y + (1 - a) * 10, F.sans(size, 700), color, { ls, alpha: a });
}

// sprite de moeda
function coin(ctx, x, y, r, spin = 0, a = 1, shine = 0) {
  const sx = Math.max(.08, Math.abs(Math.cos(spin)));
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sx, 1);
  const g = ctx.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, '#f4f7fb'); g.addColorStop(.35, '#a9b4c2'); g.addColorStop(.6, '#6c7684'); g.addColorStop(1, '#c9d2dc');
  ctx.fillStyle = '#3c434d'; ctx.beginPath(); ctx.arc(r * .08, r * .1, r, 0, TAU); ctx.fill();
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(40,46,56,.7)'; ctx.lineWidth = r * .1; ctx.beginPath(); ctx.arc(0, 0, r * .78, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(60,68,80,.55)'; ctx.beginPath(); ctx.arc(-r * .05, -r * .05, r * .38, 0, TAU); ctx.fill();
  ctx.restore();
  if (shine > 0) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    glow(ctx, x - r * .3, y - r * .35, r * 1.6, C.ice, .55 * shine);
    ctx.strokeStyle = rgba('#ffffff', .9 * shine); ctx.lineWidth = 2;
    const L = r * 1.3 * shine;
    ctx.beginPath(); ctx.moveTo(x - r * .3 - L, y - r * .35); ctx.lineTo(x - r * .3 + L, y - r * .35);
    ctx.moveTo(x - r * .3, y - r * .35 - L); ctx.lineTo(x - r * .3, y - r * .35 + L); ctx.stroke();
    ctx.restore();
  }
}

// engrenagem
function gearPath(cx, cy, r, teeth, rot, toothH = .16, hole = .35) {
  const p = new Path2D();
  const rIn = r * (1 - toothH), n = teeth * 4;
  for (let i = 0; i <= n; i++) {
    const a = rot + i / n * TAU;
    const k = i % 4; const rr = (k === 1 || k === 2) ? r : rIn;
    const ax = a + (k === 1 ? -.06 : k === 2 ? .06 : 0) * (12 / teeth);
    const x = cx + Math.cos(ax) * rr, y = cy + Math.sin(ax) * rr;
    i ? p.lineTo(x, y) : p.moveTo(x, y);
  }
  p.closePath();
  p.moveTo(cx + r * hole, cy); p.arc(cx, cy, r * hole, 0, TAU, true);
  return p;
}
function gear(ctx, cx, cy, r, teeth, rot, opts = {}) {
  const p = gearPath(cx, cy, r, teeth, rot, opts.toothH || .16, opts.hole || .3);
  ctx.save();
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, opts.c1 || '#4a5566'); g.addColorStop(.5, opts.c2 || '#1c222c'); g.addColorStop(1, opts.c3 || '#5d6a7c');
  ctx.fillStyle = g; ctx.fill(p, 'evenodd');
  ctx.strokeStyle = opts.edge || 'rgba(200,220,255,.35)'; ctx.lineWidth = opts.edgeW || 2.5; ctx.stroke(p);
  // raios internos
  ctx.strokeStyle = opts.spoke || 'rgba(0,0,0,.45)'; ctx.lineWidth = r * .06;
  for (let i = 0; i < 6; i++) {
    const a = rot + i / 6 * TAU;
    ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * .32, cy + Math.sin(a) * r * .32);
    ctx.lineTo(cx + Math.cos(a) * r * .74, cy + Math.sin(a) * r * .74); ctx.stroke();
  }
  ctx.restore();
}
// cruz latina
function crossPath(cx, cy, h, wRatio = .62, th = .12) {
  const p = new Path2D(); const t = h * th, w = h * wRatio, armY = cy - h * .5 + h * .28;
  p.rect(cx - t / 2, cy - h / 2, t, h);
  p.rect(cx - w / 2, armY - t / 2, w, t);
  return p;
}
function cross(ctx, cx, cy, h, color, a = 1, glowA = 0, glowC = C.gold) {
  if (glowA > 0) glow(ctx, cx, cy, h * 2.2, glowC, glowA);
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = color; ctx.fill(crossPath(cx, cy, h)); ctx.restore();
}
// cadeado
function padlock(ctx, x, y, s, a = 1, color = C.blood, shackleOpen = 0) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s / 100, s / 100);
  ctx.strokeStyle = color; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-28, -36 - shackleOpen * 10);
  ctx.arc(0, -36 - shackleOpen * 10, 28, Math.PI, 0); ctx.lineTo(28, -10 - shackleOpen * 30); ctx.stroke();
  ctx.fillStyle = color; roundRect(ctx, -46, -6, 92, 76, 14); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(0, 24, 10, 0, TAU); ctx.fill(); ctx.fillRect(-4, 26, 8, 22);
  ctx.restore();
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
// chama de lamparina
function flame(ctx, x, y, s, t, seed = 0) {
  const fl = noise1(t * 7, seed) * .12 + noise1(t * 13, seed + 4) * .06;
  const lean = noise1(t * 3, seed + 2) * .25;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s * (1 + fl));
  const g = ctx.createRadialGradient(0, -10, 2, 0, -14, 34);
  g.addColorStop(0, '#fffbe8'); g.addColorStop(.35, '#ffd27a'); g.addColorStop(.75, '#ff8a2a'); g.addColorStop(1, 'rgba(255,90,20,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-14, -6, -10, -26, lean * 30, -52);
  ctx.bezierCurveTo(10, -26, 14, -6, 0, 0); ctx.fill();
  ctx.restore();
}
