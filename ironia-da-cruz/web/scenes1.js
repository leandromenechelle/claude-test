// ===== Cenas 1 e 2: gancho e o trilho =====
window.SCENES = window.SCENES || [];

// ---------------- CENA 1: GANCHO ----------------
const HOOK_W = sentWords('s1');
const HOOK_GROUPS = [
  { r: [0, 5] },
  { r: [6, 13], em: { 10: { color: C.amber, k: 1.15 } } },
  { r: [14, 18], em: { 18: { color: C.blood, k: 1.75, glow: C.blood } } },
  { r: [19, 21], em: { 21: { color: C.gold, k: 1.45, glow: C.amber } } },
  { r: [22, 27], em: { 27: { color: C.cold, k: 1.75, glow: '#5f8fff' } } },
  { r: [28, 30], em: { 28: { k: 1.2 }, 29: { k: 1.2, color: '#ffffff' }, 30: { k: 1.2 } }, shake: true },
];
HOOK_GROUPS.forEach((g, i) => { g.s = HOOK_W[g.r[0]].s - .06; });
HOOK_GROUPS.forEach((g, i) => { g.e = i < HOOK_GROUPS.length - 1 ? HOOK_GROUPS[i + 1].s : SEN.s2.start - .1; });
const JUDAS_CUT = SEN.s2.start - .12;

function hookType(ctx, t) {
  // fundo
  fillBg(ctx, [[0, '#020305'], [.5, '#080b12'], [1, '#020305']]);
  glow(ctx, W / 2, 900, 700, '#1b2436', .5);
  dust(ctx, t, 50, 3, [0, 0, W, H], '#9fb4d8', 1.8, .25, 8);
  const g = HOOK_GROUPS.find(g => t >= g.s && t < g.e + .25);
  if (!g) return;
  const base = 118;
  // layout
  const items = [];
  for (let i = g.r[0]; i <= g.r[1]; i++) {
    const w = HOOK_W[i]; const em = (g.em && g.em[i]) || {};
    const size = base * (em.k || 1);
    items.push({ w, i, em, size, txt: w.w.toUpperCase(), wd: measure(ctx, w.w.toUpperCase(), F.disp(size), 2) });
  }
  const lines = [[]]; let lw = 0; const maxW = 920, sp = 26;
  items.forEach(it => { if (lw + it.wd > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(it); lw += it.wd + sp; });
  const lhs = lines.map(l => Math.max(...l.map(i => i.size)) * 1.08);
  const totH = lhs.reduce((a, b) => a + b, 0);
  let y = 880 - totH / 2;
  const exitP = E.in(inv(g.e - .02, g.e + .22, t));
  lines.forEach((ln, li) => {
    const tot = ln.reduce((a, b) => a + b.wd, 0) + sp * (ln.length - 1);
    let x = W / 2 - tot / 2; const yy = y + lhs[li] / 2;
    ln.forEach(it => {
      const ap = E.out(inv(it.w.s - .04, it.w.s + .14, t));
      if (ap > 0) {
        const k = lerp(1.4, 1, E.back(inv(it.w.s - .04, it.w.s + .2, t)));
        let jx = 0, jy = 0;
        if (g.shake && t > it.w.s) { const amp = 10 * Math.exp(-(t - it.w.s) * 3) + 3; jx = noise1(t * 40 + it.i, 3) * amp; jy = noise1(t * 37 + it.i, 9) * amp; }
        ctx.save();
        ctx.globalAlpha = ap * (1 - exitP);
        ctx.translate(x + it.wd / 2 + jx, yy - exitP * 90 + jy); ctx.scale(k, k);
        if (it.em.glow) glow(ctx, 0, 0, it.wd * .9, it.em.glow, .35 * ap);
        if (g.shake) { // separação cromática
          ctx.globalCompositeOperation = 'screen';
          text(ctx, it.txt, -5, 0, F.disp(it.size), '#ff3040', { ls: 2, alpha: .7 * ap * (1 - exitP) });
          text(ctx, it.txt, 5, 0, F.disp(it.size), '#30c0ff', { ls: 2, alpha: .7 * ap * (1 - exitP) });
          ctx.globalCompositeOperation = 'source-over';
        }
        text(ctx, it.txt, 0, 0, F.disp(it.size), it.em.color || '#f2f4f8', { ls: 2, shadow: it.em.glow ? rgba(it.em.glow, .8) : 'rgba(0,0,0,.6)', blur: it.em.glow ? 40 : 20 });
        ctx.restore();
      }
      x += it.wd + sp;
    });
    y += lhs[li];
  });
}

// moedas na mão (monte)
const PILE = [];
for (let i = 0; i < 16; i++) {
  const row = i < 6 ? 0 : i < 11 ? 1 : i < 14 ? 2 : 3;
  const inRow = [6, 5, 3, 2][row], idx = i - [0, 6, 11, 14][row];
  PILE.push({ x: (idx - (inRow - 1) / 2) * 30 + (rnd(i, 4) - .5) * 8, y: -row * 15 + (rnd(i, 5) - .5) * 5, r: 21, spin: (rnd(i, 6) - .5) * .9 });
}
const DROPS = [
  { t0: SEN.s2.start + .35, x: -30 }, { t0: SEN.s3.start + .5, x: 36 }, { t0: ws('s4', 'coragem'), x: -6 },
  { t0: ws('s4', 'historia') - .2, x: 22 }, { t0: ws('s4', 'cruz') + .1, x: -40 },
];
function hookJudas(ctx, t) {
  const lt = t - JUDAS_CUT;
  fillBg(ctx, [[0, '#0b1424'], [.45, '#060a12'], [1, '#020306']]);
  const push = 1 + E.inOut(clamp(lt / 9)) * .07;
  ctx.save();
  ctx.translate(W / 2, 820); ctx.scale(push, push); ctx.translate(-W / 2, -820);
  // luz fria de cima
  lightCone(ctx, W / 2, -80, 260, 1150, 1900, '#9cc0ff', .16, 11, t);
  glow(ctx, W / 2, 260, 520, '#8fb4ff', .22);
  dust(ctx, t, 70, 12, [200, 0, 680, 1500], C.ice, 2, .55, 10);
  // figura
  const s = 1900, fx = W / 2, fy = 330 + s;
  const br = Math.sin(lt * 1.6) * .004;
  ctx.translate(fx, fy); ctx.scale(1, 1 + br); ctx.translate(-fx, -fy);
  const body = place(robedFrontUnit({ pose: 'none' }), fx, fy, s);
  shade(ctx, body, { fill: '#080b11', rim: '#c9dcff', rimA: .95, dx: 0, dy: 7, rim2: '#5b7fb8', rim2A: .35, dx2: -5, dy2: 0 });
  ctx.save(); ctx.clip(body);
  // dobras do tecido
  for (let i = 0; i < 7; i++) {
    const x = fx + (i - 3) * 78 + Math.sin(i * 2.3) * 20;
    const g = ctx.createLinearGradient(x - 40, 0, x + 40, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.5, i % 2 ? 'rgba(0,0,0,.35)' : 'rgba(130,160,210,.06)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x - 40, 820, 80, 1200);
  }
  const top = ctx.createLinearGradient(0, 300, 0, 900); top.addColorStop(0, 'rgba(160,190,240,.12)'); top.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = top; ctx.fillRect(0, 300, W, 600);
  ctx.restore();
  // rosto oculto no capuz, com o queixo e a barba tocados pela luz das moedas
  const face = place(hoodFaceUnit(), fx, fy, s);
  ctx.fillStyle = '#010102'; ctx.fill(face);
  ctx.save(); ctx.clip(face);
  const chinY = fy - s * .865;
  const cg = ctx.createRadialGradient(fx, chinY + 70, 10, fx, chinY + 10, 120);
  cg.addColorStop(0, 'rgba(120,140,175,.55)'); cg.addColorStop(.5, 'rgba(60,72,95,.25)'); cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(fx, chinY, s * .036, s * .04, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(150,170,205,.18)'; ctx.beginPath(); ctx.ellipse(fx + 4, fy - s * .905, 9, 6, 0, 0, TAU); ctx.fill();
  ctx.restore();
  // sombra dos braços sobre o corpo e os braços com recorte de luz
  const arms = place(armsFrontUnit('cupped', { sleeve: 1.3 }), fx, fy, s);
  ctx.save(); ctx.translate(0, 26); ctx.globalAlpha = .7; ctx.fillStyle = '#000'; ctx.fill(arms); ctx.restore();
  shade(ctx, arms, { fill: '#111724', rim: '#dce8ff', rimA: 1, dx: 0, dy: 6, rim2: '#4a6390', rim2A: .5, dx2: 0, dy2: -10 });
  // monte de moedas
  const hx = fx, hy = fy - s * .585;
  glow(ctx, hx, hy - 10, 260, '#cfe0ff', .22);
  ctx.save(); ctx.translate(hx, hy); ctx.scale(1.3, 1.3);
  PILE.forEach((c, i) => {
    const sh = Math.max(0, Math.sin(t * 1.7 + i * 1.3) * 1.4 - .6) * (i % 3 === 0 ? 1 : .4);
    coin(ctx, c.x, c.y, c.r, c.spin, 1, sh);
  });
  ctx.restore();
  // moedas caindo
  DROPS.forEach((d, i) => {
    const dt = t - d.t0; if (dt < 0 || dt > 1.6) return;
    const y = hy - 20 + 0.5 * 2600 * dt * dt, x = hx + d.x + dt * (i % 2 ? 60 : -50);
    coin(ctx, x, y, 21, dt * 9 + i, clamp(1.6 - dt), .7);
  });
  ctx.restore();
  // título
  const ta = win(t, SEN.s4.end + .45, SEN.s5.start + .2, .5, .3);
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha = ta;
    const g2 = ctx.createLinearGradient(0, 1250, 0, 1700); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(.4, 'rgba(0,0,0,.7)'); g2.addColorStop(1, 'rgba(0,0,0,.7)');
    ctx.fillStyle = g2; ctx.fillRect(0, 1250, W, 670);
    const k = lerp(1.08, 1, E.out(ta));
    ctx.translate(W / 2, 1440); ctx.scale(k, k);
    text(ctx, 'A IRONIA DA CRUZ', 0, 0, F.disp(132), '#f5f1e8', { ls: 6, shadow: 'rgba(255,200,120,.35)', blur: 40 });
    text(ctx, 'E se o “vilão” tiver sido a engrenagem?', 0, 110, F.serif(54), C.gold, { ls: 1 });
    ctx.restore();
  }
}

SCENES.push({
  id: 'hook', a: 0, b: SEN.s5.start + .25, capY: 1430,
  draw(ctx, t) {
    if (t < JUDAS_CUT) hookType(ctx, t); else hookJudas(ctx, t);
    // flash no corte
    const fl = 1 - inv(JUDAS_CUT, JUDAS_CUT + .35, t);
    if (t >= JUDAS_CUT && fl > 0) { ctx.save(); ctx.fillStyle = '#dfe9ff'; ctx.globalAlpha = fl * .9; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
});

// ---------------- CENA 2: O TRILHO ----------------
const TR = { vy: 640, f: 768, h: 1.0, zCross: 44 };
const TR_A = SEN.s5.start - .45, TR_B = SEN.s12.start + .3;
const CAM_KEYS = [
  [TR_A, 0], [SEN.s6.start, 3], [SEN.s7.start, 9.5], [SEN.s8.start, 14.5], [SEN.s9.start, 19.5],
  [SEN.s10.start, 26.5], [SEN.s11.start, 31], [SEN.s11.end, 37.2], [TR_B, 38.6]
];
function camAt(t) {
  for (let i = 0; i < CAM_KEYS.length - 1; i++) {
    const [ta, za] = CAM_KEYS[i], [tb, zb] = CAM_KEYS[i + 1];
    if (t <= tb) return lerp(za, zb, E.sine(inv(ta, tb, t)));
  }
  return CAM_KEYS[CAM_KEYS.length - 1][1];
}
function pj(X, Y, Z) { return [W / 2 + TR.f * X / Z, TR.vy + TR.f * (TR.h - Y) / Z]; }
const STATIONS = [
  { z: 10.5, txt: 'A ENTREGA', a: () => ws('s6', 'entrega') - .3, b: () => SEN.s7.start },
  { z: 15.8, txt: 'PRESCIÊNCIA', a: () => SEN.s7.start - .1, b: () => SEN.s8.start },
  { z: 21, txt: 'PROFECIA', a: () => SEN.s8.start - .1, b: () => SEN.s9.start + .2 },
];
const SWITCH_Z = 30;

function trackScene(ctx, t) {
  const cam = camAt(t);
  // céu
  fillBg(ctx, [[0, '#03050a'], [.25, '#0b1222'], [.333, '#2a2430'], [.34, '#0d1119'], [1, '#030407']]);
  stars(ctx, t, 90, 21, 60, 600, .6);
  const zc = TR.zCross - cam;
  const near = clamp(1 - zc / 40);
  glow(ctx, W / 2, TR.vy - 20, 520 + near * 300, '#ffb36b', .22 + near * .35);
  // chão (neblina)
  const gg = ctx.createLinearGradient(0, TR.vy, 0, H);
  gg.addColorStop(0, '#2a2430'); gg.addColorStop(.06, '#141822'); gg.addColorStop(.5, '#0a0d13'); gg.addColorStop(1, '#050608');
  ctx.fillStyle = gg; ctx.fillRect(0, TR.vy, W, H - TR.vy);
  const zFar = Math.max(1, zc);
  // leito de brita
  { const [l1, m1] = pj(-1.25, 0, .5), [r1] = pj(1.25, 0, .5), [l2, m2] = pj(-1.25, 0, zFar), [r2] = pj(1.25, 0, zFar);
    const bg = ctx.createLinearGradient(0, m2, 0, H); bg.addColorStop(0, '#3a3138'); bg.addColorStop(.3, '#1d1c21'); bg.addColorStop(1, '#141418');
    ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(l1, m1); ctx.lineTo(r1, m1); ctx.lineTo(r2, m2); ctx.lineTo(l2, m2); ctx.fill();
    // pedrinhas
    for (let i = 0; i < 420; i++) {
      const z = (((rnd(i, 61) * 20 - cam) % 20) + 20) % 20; if (z < .55 || z > zFar) continue;
      const [x, y] = pj((rnd(i, 62) - .5) * 2.4, 0, z); const r = Math.max(.6, 9 / z * (.4 + rnd(i, 63)));
      ctx.fillStyle = rnd(i, 64) > .5 ? 'rgba(120,110,115,.35)' : 'rgba(0,0,0,.4)'; ctx.fillRect(x, y, r, r * .6);
    }
  }
  // dormentes
  const step = .62;
  const k0 = Math.floor((cam + .75) / step);
  for (let k = k0 + 160; k >= k0; k--) {
    const z = k * step - cam; if (z < .75 || z > zFar) continue;
    const z2 = z + .16;
    const [x1, y1] = pj(-.88, .05, z), [x2] = pj(.88, .05, z), [x3, y3] = pj(-.88, .05, z2), [x4] = pj(.88, .05, z2);
    const [, yb] = pj(0, 0, z);
    const fog = 1 - Math.exp(-z / 14);
    ctx.fillStyle = `rgb(${lerp(58, 46, fog)},${lerp(44, 38, fog)},${lerp(36, 46, fog)})`;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y1); ctx.lineTo(x4, y3); ctx.lineTo(x3, y3); ctx.fill();
    ctx.fillStyle = `rgb(${lerp(26, 34, fog)},${lerp(20, 30, fog)},${lerp(18, 36, fog)})`;
    ctx.fillRect(x1, y1, x2 - x1, Math.max(1, yb - y1));
  }
  // trilhos metálicos (boleto + alma)
  [-.55, .55].forEach(X => {
    const zA = .45, zB = zFar;
    const [a1, b1] = pj(X - .04, .16, zA), [a2] = pj(X + .04, .16, zA), [c1, d1] = pj(X - .04, .16, zB), [c2] = pj(X + .04, .16, zB);
    const inner = X < 0 ? X + .04 : X - .04;
    const [e1, f1] = pj(inner, 0, zA), [e2, f2] = pj(inner, 0, zB), [g1, h1] = pj(inner, .16, zA), [g2, h2] = pj(inner, .16, zB);
    ctx.fillStyle = '#20252d'; ctx.beginPath(); ctx.moveTo(g1, h1); ctx.lineTo(e1, f1); ctx.lineTo(e2, f2); ctx.lineTo(g2, h2); ctx.fill();
    const g = ctx.createLinearGradient(0, b1, 0, d1);
    g.addColorStop(0, '#aeb8c6'); g.addColorStop(.35, '#6f7a88'); g.addColorStop(1, '#c7a888');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(a1, b1); ctx.lineTo(a2, b1); ctx.lineTo(c2, d1); ctx.lineTo(c1, d1); ctx.fill();
    const [s1, t1] = pj(X, .16, zA), [s2, t2] = pj(X, .16, zB);
    ctx.strokeStyle = 'rgba(240,246,255,.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(s1, t1); ctx.lineTo(s2, t2); ctx.stroke();
  });
  // desvio fantasma (segunda via)
  const zs = SWITCH_Z - cam;
  const ghostA = win(t, ws('s9', 'segunda') - .3, SEN.s10.end + .2, .5, .6) * (t > SEN.s10.start ? (.55 + .45 * noise1(t * 9, 4)) : 1);
  if (ghostA > 0 && zs > .5) {
    ctx.save(); ctx.globalAlpha = ghostA; ctx.setLineDash([22, 16]); ctx.lineDashOffset = -t * 60;
    ctx.strokeStyle = '#7fd2ff'; ctx.lineWidth = 4; ctx.shadowColor = '#4fb8ff'; ctx.shadowBlur = 18;
    [-.55, .55].forEach(X0 => {
      ctx.beginPath();
      for (let i = 0; i <= 40; i++) {
        const z = zs + i * .35; if (z > zFar) break;
        const X = X0 - Math.pow(i * .35, 1.9) * .16;
        const [x, y] = pj(X, .12, Math.max(.5, z)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    });
    ctx.restore();
    const [lx, ly] = pj(-2.2, 1.4, Math.max(.8, zs + 3));
    label(ctx, 'SEGUNDA VIA?', clamp(lx, 200, 880), Math.max(380, ly), ghostA, '#9fdcff', 40, 6);
    // dissolução em partículas
    if (t > SEN.s10.start) dust(ctx, t, 40, 77, [80, 520, 500, 380], '#9fdcff', 2.5, ghostA * .8, 30);
  }
  // estações
  STATIONS.forEach((st, i) => {
    const z = st.z - cam; if (z < .5 || z > 30) return;
    const [px, py] = pj(1.35, 0, z); let [qx, qy] = pj(1.35, 1.9, z);
    const a = clamp((30 - z) / 10) * clamp((z - .5) / .6);
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = '#c9a36b'; ctx.lineWidth = Math.max(2, 14 / z); ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
    glow(ctx, qx, qy, 220 / z + 10, C.amber, .7);
    ctx.restore();
    const la = win(t, st.a(), st.b(), .3, .3) * clamp((z - .9) / .5);
    if (la > 0) {
      const lw_ = measure(ctx, st.txt, F.disp(54), 3); const lx = clamp(qx + 30, 560, 1030 - lw_); qy = Math.max(qy, 430);
      ctx.save(); ctx.globalAlpha = la;
      ctx.strokeStyle = rgba(C.amber, .8); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.lineTo(lx, qy - 60); ctx.lineTo(lx + 10, qy - 60); ctx.stroke();
      ctx.restore();
      text(ctx, st.txt, lx + 14, qy - 60, F.disp(54), C.bone, { align: 'left', ls: 3, alpha: la, shadow: 'rgba(0,0,0,.9)', blur: 20 });
    }
  });
  // a cruz no fim do trilho
  if (zc > .8) {
    const [bx, by] = pj(0, 0, zc), [, ty] = pj(0, 3.2, zc);
    const hgt = by - ty, flare = win(t, SEN.s11.end - .4, TR_B + 1, .6, .1);
    glow(ctx, bx, ty + hgt * .35, hgt * 2.2, '#ffcf8a', .25 + near * .3 + flare * .6);
    cross(ctx, bx, ty + hgt / 2, hgt, '#0a0a0e', 1);
    ctx.save(); ctx.clip(crossPath(bx, ty + hgt / 2, hgt)); glow(ctx, bx, ty, hgt * .8, '#ffcf8a', .25 + flare * .5); ctx.restore();
  }
  // o ponto luminoso
  const oz = 2.6, bob = Math.sin(t * 3) * .02;
  const [ox, oy] = pj(0, .42 + bob, oz);
  // rastro
  const tr = ctx.createLinearGradient(0, oy, 0, oy + 420);
  tr.addColorStop(0, 'rgba(255,214,150,.55)'); tr.addColorStop(1, 'rgba(255,214,150,0)');
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = tr;
  ctx.beginPath(); ctx.moveTo(ox - 14, oy); ctx.lineTo(ox + 14, oy); ctx.lineTo(ox + 60, oy + 420); ctx.lineTo(ox - 60, oy + 420); ctx.fill(); ctx.restore();
  glow(ctx, ox, oy, 260, '#ffb867', .55);
  glow(ctx, ox, oy, 70, '#fff4dc', 1);
  ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(ox, oy, 15, 0, TAU); ctx.fill();
  // reflexo nos trilhos
  [-.55, .55].forEach(X => { const [rx, ry] = pj(X, .12, oz); glow(ctx, rx, ry, 120, '#ffd59a', .5); });
  dust(ctx, t, 40, 31, [0, 500, W, 900], '#ffd9a8', 1.6, .3, 6);

  // referências bíblicas
  refTag(ctx, 'João 6:64', W / 2, 250, win(t, SEN.s7.start - .1, SEN.s9.start - .2, .45, .4));
  refTag(ctx, 'Mateus 26:21-25', W / 2, 320, win(t, SEN.s8.start - .1, SEN.s9.start - .2, .45, .4));

  // carimbo VILÃO
  const vs = ws('s11', 'vilao') - .05;
  const va = win(t, vs, TR_B, .05, .4);
  if (va > 0) {
    const slam = E.out(inv(vs, vs + .18, t));
    const k = lerp(2.2, 1, slam);
    const shake = (1 - inv(vs + .1, vs + .6, t)) * 14;
    const fade = 1 - .55 * tw(t, ws('s11', 'injusto') - .2, ws('s11', 'injusto') + .5);
    ctx.save(); ctx.globalAlpha = va * fade;
    ctx.translate(W / 2 + noise1(t * 50, 1) * shake, 1060 + noise1(t * 47, 2) * shake); ctx.rotate(-.1); ctx.scale(k, k);
    ctx.strokeStyle = C.blood; ctx.lineWidth = 12; roundRect(ctx, -330, -120, 660, 240, 18); ctx.stroke();
    text(ctx, 'VILÃO', 0, 6, F.disp(200), C.blood, { ls: 14 });
    // textura de carimbo
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 140; i++) { ctx.globalAlpha = .5 + rnd(i, 3) * .5; ctx.beginPath(); ctx.arc((rnd(i, 1) - .5) * 680, (rnd(i, 2) - .5) * 250, 2 + rnd(i, 4) * 7, 0, TAU); ctx.fill(); }
    ctx.restore();
    const qa = tw(t, ws('s11', 'injusto') - .1, ws('s11', 'injusto') + .3, E.back);
    if (qa > 0) text(ctx, '?', W / 2 + 330, 960, F.disp(260), C.bone, { alpha: qa * va, shadow: 'rgba(0,0,0,.8)', blur: 30 });
  }
}
SCENES.push({ id: 'trilho', a: TR_A, b: TR_B, tin: 'fade', capY: 1430, draw: trackScene });
