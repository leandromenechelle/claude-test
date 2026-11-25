// ===== Composição: cenas, transições, legendas, grão e vinheta =====
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const bufA = mk(), bufB = mk();
const ctxA = bufA.getContext('2d'), ctxB = bufB.getContext('2d');
const DURATION = TM.duration;

// ---------- grão de filme e vinheta (pré-calculados) ----------
const GRAIN = [];
for (let k = 0; k < 6; k++) {
  const g = document.createElement('canvas'); g.width = 360; g.height = 640;
  const gx = g.getContext('2d'); const im = gx.createImageData(360, 640);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (rnd(i / 4, k + 50) - .5) * 200; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  gx.putImageData(im, 0, 0); GRAIN.push(g);
}
const VIG = mk(); {
  const v = VIG.getContext('2d');
  const g = v.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .5, H * .78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.7, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,.85)');
  v.fillStyle = g; v.fillRect(0, 0, W, H);
}

// ---------- legendas palavra a palavra ----------
const NOCAP = new Set(['s1', 's37', 's38']);
const CHUNKS = [];
(function buildChunks() {
  const bySid = {};
  TM.words.forEach(w => (bySid[w.sid] = bySid[w.sid] || []).push(w));
  TM.sentences.forEach(s => {
    if (NOCAP.has(s.id)) return;
    let cur = [], chars = 0;
    const flush = () => { if (cur.length) { CHUNKS.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e, sid: s.id }); cur = []; chars = 0; } };
    bySid[s.id].forEach((w, i, arr) => {
      cur.push(w); chars += w.w.length + 1;
      const punct = /[,.?!:]$/.test(w.w);
      const nextLen = arr[i + 1] ? arr[i + 1].w.length : 0;
      if (punct && cur.length >= 2 || chars + nextLen > 24 || cur.length >= 5) flush();
    });
    flush();
  });
  for (let i = 0; i < CHUNKS.length; i++) {
    const c = CHUNKS[i], n = CHUNKS[i + 1];
    c.show = c.s - 0.06;
    c.hide = (n && n.s - c.e < 0.7) ? n.s - 0.06 : c.e + 0.45;
  }
})();
function drawCaptions(ctx, t, y0) {
  const c = CHUNKS.find(c => t >= c.show && t < c.hide);
  if (!c) return;
  const size = 60, font = F.sans(size, 900);
  ctx.save(); ctx.font = font; ctx.letterSpacing = '0.5px';
  const items = c.words.map(w => ({ w, txt: w.w.toUpperCase(), wd: ctx.measureText(w.w.toUpperCase()).width }));
  const space = 18, maxW = 900; const lines = [[]]; let lw = 0;
  items.forEach(it => { if (lw + it.wd > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(it); lw += it.wd + space; });
  const lh = size * 1.18;
  const pop = E.back(inv(c.show, c.show + .16, t));
  const out = 1 - inv(c.hide - .1, c.hide, t);
  ctx.globalAlpha = clamp(pop) * out;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.lineJoin = 'round';
  lines.forEach((ln, li) => {
    const tot = ln.reduce((a, b) => a + b.wd, 0) + space * (ln.length - 1);
    let x = W / 2 - tot / 2; const y = y0 + (li - (lines.length - 1) / 2) * lh + (1 - pop) * 14;
    ln.forEach(it => {
      const spoken = t >= it.w.s - .02, current = spoken && t < it.w.e + .04;
      const k = current ? 1 + .07 * (1 - inv(it.w.s, it.w.s + .2, t)) : 1;
      ctx.save(); ctx.translate(x + it.wd / 2, y); ctx.scale(k, k);
      ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(0,0,0,.85)';
      ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 24;
      ctx.strokeText(it.txt, -it.wd / 2, 0); ctx.shadowBlur = 0;
      ctx.fillStyle = current ? C.amber : spoken ? '#ffffff' : 'rgba(255,255,255,.42)';
      ctx.fillText(it.txt, -it.wd / 2, 0);
      ctx.restore();
      x += it.wd + space;
    });
  });
  ctx.restore();
}

// ---------- transições ----------
function composite(t, A, B) {
  const p = clamp((t - B.a) / (A.b - B.a));
  const type = B.tin || 'fade';
  ctxA.setTransform(1, 0, 0, 1, 0, 0); ctxB.setTransform(1, 0, 0, 1, 0, 0);
  if (type === 'flash') {
    if (p < .5) { A.draw(ctx, t); } else { B.draw(ctx, t); }
    ctx.save(); ctx.fillStyle = '#fff'; ctx.globalAlpha = Math.pow(1 - Math.abs(p - .5) * 2, 2) * .95; ctx.fillRect(0, 0, W, H); ctx.restore();
    return;
  }
  if (type === 'dip') {
    if (p < .5) A.draw(ctx, t); else B.draw(ctx, t);
    ctx.save(); ctx.fillStyle = '#000'; ctx.globalAlpha = 1 - Math.abs(p - .5) * 2; ctx.fillRect(0, 0, W, H); ctx.restore();
    return;
  }
  ctxA.clearRect(0, 0, W, H); ctxB.clearRect(0, 0, W, H);
  A.draw(ctxA, t); B.draw(ctxB, t);
  const e = E.inOut(p);
  if (type === 'zoom') {
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1 + e * .18, 1 + e * .18); ctx.translate(-W / 2, -H / 2); ctx.drawImage(bufA, 0, 0); ctx.restore();
    ctx.save(); ctx.globalAlpha = e; ctx.translate(W / 2, H / 2); ctx.scale(.9 + e * .1, .9 + e * .1); ctx.translate(-W / 2, -H / 2); ctx.drawImage(bufB, 0, 0); ctx.restore();
  } else if (type === 'up') {
    ctx.drawImage(bufA, 0, -e * H * .35); ctx.save(); ctx.globalAlpha = e; ctx.drawImage(bufB, 0, (1 - e) * H * .25); ctx.restore();
  } else { // fade
    ctx.drawImage(bufA, 0, 0); ctx.save(); ctx.globalAlpha = e; ctx.drawImage(bufB, 0, 0); ctx.restore();
  }
}

let FRAME_I = 0;
function renderFrame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const act = SCENES.filter(s => t >= s.a && t < s.b);
  if (act.length === 1) { ctx.save(); act[0].draw(ctx, t); ctx.restore(); }
  else if (act.length >= 2) composite(t, act[0], act[1]);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  // vinheta
  ctx.drawImage(VIG, 0, 0);
  // legendas
  const sc = act[act.length - 1];
  const capY = sc && sc.capY ? (typeof sc.capY === 'function' ? sc.capY(t) : sc.capY) : 1380;
  drawCaptions(ctx, t, capY);
  // grão
  const gi = Math.floor(t * 24) % GRAIN.length;
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .10;
  ctx.drawImage(GRAIN[gi], 0, 0, W, H); ctx.restore();
  // fade de entrada e saída
  const fin = 1 - inv(0, .5, t), fout = inv(DURATION - 1.6, DURATION - .1, t);
  const blk = Math.max(fin, fout);
  if (blk > 0) { ctx.save(); ctx.fillStyle = '#000'; ctx.globalAlpha = blk; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
window.renderFrame = renderFrame;
window.DURATION = DURATION;
window.READY = document.fonts.ready.then(() => Promise.all([
  document.fonts.load('100px Anton'), document.fonts.load('italic 600 50px "Cormorant Garamond"'),
  document.fonts.load('600 50px "Cormorant Garamond"'), document.fonts.load('900 60px Inter'),
  document.fonts.load('700 30px Inter'), document.fonts.load('800 30px Inter'),
])).then(() => { if (window.PRECOMPUTE) window.PRECOMPUTE(); return true; });
