// ===== Cena 3: o recorte do plano e a humanidade de Jesus =====
window.SCENES = window.SCENES || [];
window.PRE = window.PRE || [];
window.PRECOMPUTE = () => window.PRE.forEach(f => f());

// ---------- ícones ----------
function iconLamp(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#c98b4e';
  ctx.beginPath(); ctx.moveTo(-60, 0); ctx.quadraticCurveTo(-50, 34, 0, 36); ctx.quadraticCurveTo(50, 34, 70, 4); ctx.quadraticCurveTo(80, -6, 60, -8);
  ctx.quadraticCurveTo(0, -20, -60, 0); ctx.fill();
  ctx.fillStyle = '#8a5a30'; ctx.beginPath(); ctx.ellipse(-4, -6, 22, 7, 0, 0, TAU); ctx.fill();
  ctx.restore();
  flame(ctx, x + 62 * s, y - 8 * s, s * 1.1, t, 3);
}
function iconBread(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createRadialGradient(-20, -20, 10, 0, 0, 80); g.addColorStop(0, '#e7b878'); g.addColorStop(1, '#8a5528');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 70, 44, -.1, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,20,.8)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 26 - 12, -22); ctx.quadraticCurveTo(i * 26, 0, i * 26 + 12, 22); ctx.stroke(); }
  ctx.restore();
}
function chalicePath() {
  const p = new Path2D();
  p.moveTo(-62, -70); p.quadraticCurveTo(-60, 20, -10, 34); p.lineTo(-8, 80); p.quadraticCurveTo(-46, 92, -50, 104); p.lineTo(50, 104);
  p.quadraticCurveTo(46, 92, 8, 80); p.lineTo(10, 34); p.quadraticCurveTo(60, 20, 62, -70); p.closePath(); return p;
}
function iconChalice(ctx, x, y, s, color = '#d9b46a') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#6e5428'); g.addColorStop(.35, color); g.addColorStop(1, '#5a4320');
  ctx.fillStyle = g; ctx.fill(chalicePath());
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0, -70, 62, 12, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function medallion(ctx, x, y, r, a, hi, draw) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  glow(ctx, x, y, r * 2, C.amber, .18 + hi * .3);
  ctx.fillStyle = '#0d0b0a'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba(C.amber, .5 + hi * .5); ctx.lineWidth = 3; ctx.stroke();
  ctx.strokeStyle = rgba(C.amber, .2); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r + 14, 0, TAU); ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 4, 0, TAU); ctx.clip(); draw(); ctx.restore();
  ctx.restore();
}

// ---------------- 3a: o plano, as moedas e o campo ----------------
const PL_A = SEN.s12.start - .35, PL_B = SEN.s15.start + .35;
const RAIL_Y = 560, ST_X = 430, CR_X = 960;
const FIELD = { y0: 1010, y1: 1330, wTop: 520, wBot: 980 };
const FCOINS = [];
for (let i = 0; i < 30; i++) {
  const v = rnd(i, 81), u = rnd(i, 82) - .5;
  const y = lerp(FIELD.y0 + 30, FIELD.y1 - 20, v), w = lerp(FIELD.wTop, FIELD.wBot, v);
  FCOINS.push({ tx: W / 2 + u * w * .85, ty: y, d: i * .055 + rnd(i, 83) * .15, spin: rnd(i, 84) * 6 });
}
function planoScene(ctx, t) {
  fillBg(ctx, [[0, '#07080c'], [.5, '#0b0a0c'], [1, '#050404']]);
  glow(ctx, W / 2, 1150, 650, '#3b2618', .35);
  dust(ctx, t, 40, 41, [0, 0, W, H], '#e8c79a', 1.6, .25, 6);
  const tr = SEN.s14.start, fadeTop = 1 - tw(t, tr, tr + .6);
  const tE = ws('s12', 'entrega'), tM = ws('s12', 'moedas'), tR = ws('s13', 'remorso'), tC = ws('s13', 'colapso');
  if (fadeTop > 0) {
    ctx.save(); ctx.globalAlpha = fadeTop;
    // trilho visto de lado
    const rg = ctx.createLinearGradient(60, 0, 1020, 0); rg.addColorStop(0, 'rgba(150,160,175,.2)'); rg.addColorStop(.2, '#8b96a5'); rg.addColorStop(1, '#c9a46e');
    ctx.fillStyle = rg; ctx.fillRect(60, RAIL_Y - 4, 960, 8);
    for (let x = 80; x < 1010; x += 34) { ctx.fillStyle = 'rgba(90,70,55,.55)'; ctx.fillRect(x, RAIL_Y + 6, 14, 12); }
    // estação ENTREGA
    glow(ctx, ST_X, RAIL_Y, 90, C.amber, .5); ctx.fillStyle = C.amber; ctx.beginPath(); ctx.arc(ST_X, RAIL_Y, 9, 0, TAU); ctx.fill();
    label(ctx, 'A ENTREGA', ST_X, RAIL_Y - 56, 1, C.bone, 30, 6);
    // cruz no fim
    cross(ctx, CR_X, RAIL_Y - 70, 120, '#120d0a', 1, .5, '#ffcf8a');
    ctx.save(); ctx.clip(crossPath(CR_X, RAIL_Y - 70, 120)); glow(ctx, CR_X, RAIL_Y - 110, 90, '#ffcf8a', .6); ctx.restore();
    // orbe dourado (o plano) e orbe frio (Judas)
    const gx = t < tE ? lerp(90, ST_X, E.inOut(inv(PL_A, tE, t))) : t < tR ? ST_X : lerp(ST_X, CR_X - 30, E.inOut(inv(tR, SEN.s14.start, t)));
    const bTravel = t < tE ? gx - 58 : ST_X - 58;
    glow(ctx, gx, RAIL_Y - 18, 160, '#ffb867', .55); glow(ctx, gx, RAIL_Y - 18, 40, '#fff4dc', 1);
    ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(gx, RAIL_Y - 18, 12, 0, TAU); ctx.fill();
    // Judas: cai fora do trilho
    const fall = inv(tR, tC + 1.6, t);
    const bx = bTravel + E.out(fall) * 40, by = RAIL_Y - 16 + E.in(fall) * 700;
    const ba = 1 - E.in(inv(tR + .4, tC + 2.2, t));
    if (ba > 0) {
      glow(ctx, bx, by, 110, '#7fa8ff', .5 * ba); ctx.fillStyle = rgba('#d6e4ff', ba); ctx.beginPath(); ctx.arc(bx, by, 10, 0, TAU); ctx.fill();
      if (fall > 0) { ctx.save(); ctx.globalAlpha = ba * .5; ctx.strokeStyle = '#7fa8ff'; ctx.setLineDash([4, 10]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ST_X - 58, RAIL_Y - 16); ctx.quadraticCurveTo(bx, RAIL_Y, bx, by); ctx.stroke(); ctx.restore(); }
    }
    label(ctx, 'FORA DO TRILHO', ST_X - 40, 900, win(t, tC - .2, SEN.s14.start, .4, .5), '#9fbaf0', 28, 6);
    // campo do oleiro
    const fa = tw(t, tM - .6, tM + .2);
    if (fa > 0) {
      ctx.save(); ctx.globalAlpha = fa * fadeTop;
      const f = FIELD;
      const gg = ctx.createLinearGradient(0, f.y0, 0, f.y1); gg.addColorStop(0, '#1a120c'); gg.addColorStop(1, '#2c1d11');
      const fp = new Path2D(); fp.moveTo(W / 2 - f.wTop / 2, f.y0); fp.lineTo(W / 2 + f.wTop / 2, f.y0); fp.lineTo(W / 2 + f.wBot / 2, f.y1); fp.lineTo(W / 2 - f.wBot / 2, f.y1); fp.closePath();
      ctx.fillStyle = gg; ctx.fill(fp);
      ctx.save(); ctx.clip(fp);
      for (let i = 0; i < 260; i++) { const v = rnd(i, 70), y = lerp(f.y0, f.y1, v), w = lerp(f.wTop, f.wBot, v); const x = W / 2 + (rnd(i, 71) - .5) * w; const r = 2 + rnd(i, 72) * 6 * (.5 + v);
        ctx.fillStyle = rnd(i, 73) > .5 ? 'rgba(90,62,38,.5)' : 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(x, y, r * 1.6, r * .6, 0, 0, TAU); ctx.fill(); }
      ctx.strokeStyle = 'rgba(10,6,3,.55)'; ctx.lineWidth = 4;
      for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * f.wTop / 13, f.y0); ctx.quadraticCurveTo(W / 2 + i * (f.wTop + f.wBot) / 26 + 12, (f.y0 + f.y1) / 2, W / 2 + i * f.wBot / 13, f.y1); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(110,120,70,.5)'; ctx.lineWidth = 2;
      for (let i = 0; i < 70; i++) { const v = rnd(i, 74), y = lerp(f.y0, f.y1, v), w = lerp(f.wTop, f.wBot, v); const x = W / 2 + (rnd(i, 75) - .5) * w; const hh = 6 + 10 * v;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y - hh); ctx.moveTo(x, y); ctx.lineTo(x + 4, y - hh * .8); ctx.stroke(); }
      ctx.restore();
      ctx.strokeStyle = rgba(C.amber, .35); ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(W / 2 - f.wTop / 2, f.y0); ctx.lineTo(W / 2 + f.wTop / 2, f.y0); ctx.lineTo(W / 2 + f.wBot / 2, f.y1); ctx.lineTo(W / 2 - f.wBot / 2, f.y1); ctx.closePath(); ctx.stroke();
      ctx.restore();
      label(ctx, 'CAMPO DO OLEIRO', W / 2, f.y1 + 46, fa * fadeTop * win(t, tM, SEN.s14.start, .5, .5), '#d8b892', 26, 7);
    }
    // 30 moedas caindo da entrega para o campo
    FCOINS.forEach((c, i) => {
      const t0 = tM - .15 + c.d, dt = t - t0; if (dt < 0) return;
      const T = .75; const p = clamp(dt / T);
      const x = lerp(ST_X + (rnd(i, 85) - .5) * 30, c.tx, E.out(p));
      let y = lerp(RAIL_Y + 10, c.ty, p * p);
      if (p >= 1) { const b = dt - T; y = c.ty - Math.abs(Math.sin(b * 12)) * 18 * Math.exp(-b * 7); }
      const sp = p < 1 ? c.spin + dt * 14 : c.spin + T * 14 + Math.min(dt - T, .4) * 4;
      coin(ctx, x, y, 15, sp, 1, p >= 1 ? Math.max(0, Math.sin(t * 2 + i) - .7) * 2 : .4);
    });
    ctx.restore();
  }
  refTag(ctx, 'Mateus 27:3-10', W / 2, 300, win(t, tR - .2, SEN.s14.start + .2, .5, .5));
  // três momentos
  const ma = tw(t, SEN.s14.start + .2, SEN.s14.start + .8);
  if (ma > 0) {
    const hiT = ws('s14', 'humanidade');
    label(ctx, 'TRÊS MOMENTOS', W / 2, 560, ma * win(t, SEN.s14.start, PL_B, .5, .3), C.amber, 30, 12);
    const items = [['I', 'A CEIA', () => iconLamp(ctx, 0, 0, 1.2, t)], ['II', 'O BOCADO', () => iconBread(ctx, 0, 0, 1.25)], ['III', 'O JARDIM', () => iconChalice(ctx, 0, 6, 1.0)]];
    items.forEach(([n, l, d], i) => {
      const x = 200 + i * 340, y = 860;
      const a = tw(t, ws('s14', 'tres') + i * .25, ws('s14', 'tres') + i * .25 + .5, E.out);
      const hi = win(t, hiT + i * .3, hiT + i * .3 + 1.2, .3, .6);
      const k = lerp(.7, 1, E.back(a));
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      medallion(ctx, 0, 0, 130, a, hi, () => { glow(ctx, 0, 20, 160, C.amber, .25); d(); });
      ctx.restore();
      text(ctx, n, x, y - 190, F.serifN(44, 700), C.amber, { alpha: a });
      label(ctx, l, x, y + 188, a, C.bone, 30, 5);
    });
  }
}
SCENES.push({ id: 'plano', a: PL_A, b: PL_B, tin: 'flash', capY: 1450, draw: planoScene });

// ---------------- 3b: a ceia ----------------
const CE_A = SEN.s15.start - .3, CE_B = SEN.s16.start + .3;
const DISC = [
  { x: 90, hood: false, k: .9 }, { x: 225, hood: true, k: .95 }, { x: 365, hood: false, k: 1 },
  { x: 540, hood: false, k: 1.12, jesus: true }, { x: 715, hood: true, k: 1 }, { x: 855, hood: false, k: .95 },
  { x: 990, hood: true, k: .92, judas: true },
];
function ceiaScene(ctx, t) {
  const lt = t - CE_A;
  const LX = 540, LY = 1118;
  const fl = 1 + noise1(t * 6, 5) * .06 + noise1(t * 15, 6) * .03 + win(t, ws('s15', 'alerta'), ws('s15', 'destino') + .6, .2, .5) * noise1(t * 22, 7) * .12;
  const push = 1 + E.inOut(clamp(lt / 8)) * .06;
  ctx.save(); ctx.translate(W / 2, 1000); ctx.scale(push, push); ctx.translate(-W / 2, -1000);
  // parede quente
  fillBg(ctx, [[0, '#0b0705'], [.4, '#1c120b'], [.62, '#2a1a0f'], [1, '#080504']]);
  glow(ctx, LX, LY - 120, 900 * fl, '#ff9a45', .32);
  // sombras longas na parede
  const lean = win(t, ws('s15', 'entregaria') - .3, CE_B, .8, .2);
  DISC.forEach((d, i) => {
    const sx = LX + (d.x - LX) * 1.9, sy = 860 - 360 * fl;
    const p = place(bustUnit({ hood: d.hood }), sx, sy, 520 * d.k * fl);
    ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = '#060302'; ctx.fill(p); ctx.restore();
  });
  // discípulos
  DISC.forEach((d, i) => {
    const turn = d.jesus ? 0 : lean * (d.x < LX ? 1 : -1) * 10 * (d.judas ? -0.2 : 1);
    const p = place(bustUnit({ hood: d.hood }), d.x + turn, 985, 250 * d.k);
    const rimSide = d.x < LX ? 6 : -6;
    shade(ctx, p, { fill: '#0c0806', rim: d.judas ? '#a9c4ff' : '#ffb470', rimA: d.judas ? .85 : .9, dx: rimSide * (d.judas ? -1 : 1), dy: 4 });
    if (d.jesus) glow(ctx, d.x, 900, 200, '#ffc68a', .12 + lean * .08);
  });
  // mesa
  ctx.fillStyle = vgrad(ctx, 1120, 1500, [[0, '#4a2d18'], [.06, '#2a190d'], [1, '#0d0805']]);
  ctx.fillRect(-40, 1120, W + 80, 420);
  ctx.fillStyle = vgrad(ctx, 1100, 1130, [[0, '#7a4a25'], [1, '#3a2312']]);
  ctx.fillRect(-40, 1104, W + 80, 22);
  glow(ctx, LX, 1112, 420, '#ffb25c', .35 * fl);
  // pães, cálice, tigela
  iconBread(ctx, 300, 1090, .7); iconBread(ctx, 800, 1094, .62);
  iconChalice(ctx, 655, 1060, .45, '#b89150');
  ctx.fillStyle = '#2b1a0e'; ctx.beginPath(); ctx.ellipse(420, 1104, 70, 16, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#5a3820'; ctx.beginPath(); ctx.ellipse(420, 1098, 66, 10, 0, 0, TAU); ctx.fill();
  // lamparina
  iconLamp(ctx, LX - 40, LY - 14, .9, t);
  glow(ctx, LX + 16, LY - 36, 160 * fl, '#ffd08a', .55);
  dust(ctx, t, 45, 51, [0, 300, W, 900], '#ffc98a', 1.6, .35, 5);
  ctx.restore();
  refTag(ctx, 'Mateus 26:21-25', W / 2, 280, win(t, SEN.s15.start, CE_B, .5, .3));
  label(ctx, 'A CEIA', W / 2, 360, win(t, SEN.s15.start, CE_B, .5, .3) * .9, C.amber, 26, 12);
}
SCENES.push({ id: 'ceia', a: CE_A, b: CE_B, tin: 'zoom', capY: 1600, draw: ceiaScene });

// ---------------- 3c: o bocado e a saída na noite ----------------
const BO_A = SEN.s16.start - .3, BO_B = SEN.s17.start + .35;
const BO_CUT = ws('s16', 'fazer') - .1;
function handUnit(open = 0) {
  const p = new Path2D();
  // antebraço com manga
  p.moveTo(-3.6, -.42); p.lineTo(-.55, -.22); p.lineTo(-.5, .22); p.lineTo(-3.6, .46); p.closePath();
  ellipseP(p, -.05, .02, .42, .2, -.05);               // palma
  for (let f = 0; f < 4; f++) capsule(p, .22, -.1 + f * .085, .07, .62 - Math.abs(f - 1.2) * .05, -.16 + f * .1 + open * f * .02, .055);
  capsule(p, -.1, -.14, .08, .2, -.33, .06);         // polegar
  return p;
}
function bocadoScene(ctx, t) {
  if (t < BO_CUT + .15) {
    const lt = t - BO_A;
    fillBg(ctx, [[0, '#0a0604'], [.5, '#21130a'], [1, '#080403']]);
    glow(ctx, 540, 760, 700, '#ff9a45', .3 * (1 + noise1(t * 6, 2) * .05));
    dust(ctx, t, 40, 61, [0, 300, W, 1100], '#ffc98a', 1.6, .35, 5);
    const give = E.inOut(inv(SEN.s16.start, ws('s16', 'bocado') + .5, t));
    const take = E.inOut(inv(ws('s16', 'bocado') - .2, ws('s16', 'mandar') + .2, t));
    // mão que oferece (esquerda) e mão que recebe (direita)
    const L = place(handUnit(), 180 + give * 120, 900, 260);
    shade(ctx, L, { fill: '#160d07', rim: '#ffb46a', rimA: 1, dx: 0, dy: 6 });
    const R = place(handUnit(.6), 900 - take * 110, 1020, 250, { flip: true });
    shade(ctx, R, { fill: '#0d0a0a', rim: '#a9c4ff', rimA: .8, dx: 0, dy: 6, rim2: '#ffb46a', rim2A: .6, dx2: -6, dy2: 0 });
    // separação dos dedos
    [[180 + give * 120, 900, 260, 1], [900 - take * 110, 1020, 250, -1]].forEach(([hx, hy, hs, fl]) => {
      ctx.save(); ctx.translate(hx, hy); ctx.scale(fl * hs, hs); ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = .012;
      for (let f = 1; f < 4; f++) { ctx.beginPath(); ctx.moveTo(.3, -.14 + f * .085); ctx.lineTo(.58 - Math.abs(f - 1.2) * .05, -.2 + f * .1); ctx.stroke(); }
      ctx.restore();
    });
    // o bocado
    const bx = lerp(180 + give * 120 + 170, 900 - take * 110 - 150, E.inOut(inv(ws('s16', 'bocado') + .2, ws('s16', 'mandar') + .1, t)));
    const by = lerp(870, 990, E.inOut(inv(ws('s16', 'bocado') + .2, ws('s16', 'mandar') + .1, t)));
    glow(ctx, bx, by, 120, '#ffcf8a', .35);
    ctx.save(); ctx.translate(bx, by); ctx.rotate(.3);
    const g = ctx.createRadialGradient(-10, -10, 4, 0, 0, 40); g.addColorStop(0, '#f0c68a'); g.addColorStop(.6, '#a8692f'); g.addColorStop(1, '#5a3014');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-34, -6); ctx.quadraticCurveTo(-28, -30, 4, -26); ctx.quadraticCurveTo(34, -22, 36, 4); ctx.quadraticCurveTo(30, 26, -4, 24); ctx.quadraticCurveTo(-36, 20, -34, -6); ctx.fill();
    ctx.fillStyle = 'rgba(70,20,20,.55)'; ctx.beginPath(); ctx.ellipse(14, 8, 18, 10, .4, 0, TAU); ctx.fill();
    ctx.restore();
    refTag(ctx, 'João 13:26-30', W / 2, 300, win(t, SEN.s16.start - .1, BO_CUT + .2, .4, .2));
    label(ctx, 'O BOCADO', W / 2, 380, win(t, SEN.s16.start - .1, BO_CUT + .2, .4, .2) * .9, C.amber, 26, 12);
  } else {
    // a porta para a noite
    const lt = t - BO_CUT;
    fillBg(ctx, [[0, '#090504'], [.5, '#170d07'], [1, '#050302']]);
    const DX = 540, DY0 = 560, DY1 = 1330, DW = 330;
    // a noite lá fora
    ctx.save(); ctx.beginPath(); ctx.rect(DX - DW / 2, DY0, DW, DY1 - DY0); ctx.clip();
    ctx.fillStyle = vgrad(ctx, DY0, DY1, [[0, '#0b1830'], [.7, '#16284a'], [1, '#0a1220']]); ctx.fillRect(DX - DW / 2, DY0, DW, DY1 - DY0);
    stars(ctx, t, 40, 71, DY0, DY1 - 200, .9);
    glow(ctx, DX + 80, DY0 + 140, 160, '#cfe0ff', .35);
    ctx.fillStyle = '#060a12'; ctx.fillRect(DX - DW / 2, DY1 - 150, DW, 150);
    ctx.restore();
    // luz quente de dentro, porta abrindo e fechando
    const close = E.inOut(inv(SEN.s17.start - .9, SEN.s17.start + .2, t));
    // figura saindo
    const wk = inv(BO_CUT, SEN.s16.end + .9, t);
    const fx = lerp(240, DX + 20, E.out(wk)), fsc = lerp(820, 470, E.inOut(wk));
    const fy = lerp(1560, DY1 - 40, E.inOut(wk));
    const fa = 1 - inv(SEN.s16.end + .5, SEN.s16.end + 1.1, t);
    if (fa > 0) {
      const p = place(robedSideUnit({ phase: lt * 7, walk: .9 }), fx, fy, fsc, { rot: 2 });
      shade(ctx, p, { fill: '#050304', rim: '#9fb8ec', rimA: .9, dx: -4, dy: 4, alpha: fa });
    }
    // folha da porta
    const doorW = DW * lerp(.18, 1, close);
    ctx.fillStyle = vgrad(ctx, DY0, DY1, [[0, '#2a1a0f'], [1, '#160e08']]);
    ctx.beginPath(); ctx.moveTo(DX + DW / 2, DY0); ctx.lineTo(DX + DW / 2 - doorW, DY0 + (1 - close) * 30); ctx.lineTo(DX + DW / 2 - doorW, DY1 - (1 - close) * 30); ctx.lineTo(DX + DW / 2, DY1); ctx.fill();
    ctx.strokeStyle = '#3d2716'; ctx.lineWidth = 16; ctx.strokeRect(DX - DW / 2 - 8, DY0 - 8, DW + 16, DY1 - DY0 + 8);
    // luz da noite entrando no chão
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = (1 - close) * .5;
    ctx.fillStyle = vgrad(ctx, DY1, H, [[0, 'rgba(90,130,210,.5)'], [1, 'rgba(90,130,210,0)']]);
    ctx.beginPath(); ctx.moveTo(DX - DW / 2, DY1); ctx.lineTo(DX + DW / 2 - doorW * (1 - close), DY1); ctx.lineTo(DX + 420, H); ctx.lineTo(DX - 380, H); ctx.fill(); ctx.restore();
    glow(ctx, 120, 700, 500, '#ff9a45', .18);
    // E era noite.
    const na = win(t, SEN.s16.end + .25, BO_B, .7, .3);
    text(ctx, 'E era noite.', W / 2, 400, F.serif(84), C.ice, { alpha: na, shadow: 'rgba(120,160,255,.5)', blur: 30 });
    refTag(ctx, 'João 13:30', W / 2, 300, na * .9, { size: 38 });
  }
}
SCENES.push({ id: 'bocado', a: BO_A, b: BO_B, tin: 'fade', capY: 1480, draw: bocadoScene });

// ---------------- 3d: Getsêmani ----------------
const JA_A = SEN.s17.start - .35, JA_B = SEN.s19.start + .3;
const JA_CLOSE = ws('s17', 'calice') - .35, JA_KISS = SEN.s18.start - .25;
let OLIVES = null;
PRE.push(() => {
  const mkTrees = (list, h = 1700) => {
    const cv = document.createElement('canvas'); cv.width = W + 400; cv.height = h; const x = cv.getContext('2d');
    list.forEach(([tx, sz, seed, c1, c2]) => drawOlive(x, tx + 200, h, sz, seed, c1, c2)); return cv;
  };
  OLIVES = [
    // fundo: fileira baixa no horizonte
    mkTrees([...Array(8)].map((_, i) => [-120 + i * 180 + rnd(i, 3) * 60, 330 + rnd(i, 4) * 120, 200 + i, '#13223c', '#172a48'])),
    // meio: só nas laterais
    mkTrees([[-60, 760, 301, '#0c172b', '#0f1d36'], [150, 600, 302, '#0c172b', '#0f1d36'], [930, 700, 303, '#0c172b', '#0f1d36'], [1120, 820, 304, '#0c172b', '#0f1d36']]),
    // primeiro plano: copa entrando pelo canto superior
    mkTrees([[-260, 1500, 401, '#050a14', '#060c18'], [1260, 1350, 402, '#050a14', '#060c18']], 1900),
  ];
});
function jardimWide(ctx, t) {
  const lt = t - JA_A;
  fillBg(ctx, [[0, '#040812'], [.45, '#0c1a33'], [.62, '#10203c'], [1, '#03060c']]);
  stars(ctx, t, 120, 91, 40, 900, .7);
  const mx = 790, my = 380;
  glow(ctx, mx, my, 420, '#9fc0ff', .35); ctx.fillStyle = '#e4eeff'; ctx.beginPath(); ctx.arc(mx, my, 62, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(160,180,215,.35)'; ctx.beginPath(); ctx.arc(mx - 16, my - 10, 14, 0, TAU); ctx.arc(mx + 20, my + 18, 9, 0, TAU); ctx.fill();
  const pan = lt * 5;
  if (OLIVES) ctx.drawImage(OLIVES[0], -200 - pan * .3, 1250 - 1700);
  ctx.fillStyle = vgrad(ctx, 1180, H, [[0, '#0d1a30'], [.3, '#08111f'], [1, '#03060b']]);
  ctx.beginPath(); ctx.moveTo(0, 1230); ctx.quadraticCurveTo(540, 1170, W, 1220); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  if (OLIVES) ctx.drawImage(OLIVES[1], -200 - pan * .6, 1330 - 1700);
  // rocha e figura ajoelhada
  const rock = new Path2D(); rock.moveTo(250, 1345); rock.quadraticCurveTo(255, 1170, 380, 1150); rock.quadraticCurveTo(470, 1140, 505, 1220); rock.quadraticCurveTo(525, 1290, 530, 1350); rock.closePath();
  shade(ctx, rock, { fill: '#0b1220', rim: '#bcd2ff', rimA: .55, dx: -4, dy: 5 });
  const breath = Math.sin(lt * 1.3) * .01;
  const kp = place(kneelingUnit(.6 + breath * 4), 690, 1335, 600);
  glow(ctx, 640, 1050, 300, '#9fc0ff', .16);
  shade(ctx, kp, { fill: '#060a12', rim: '#d0e0ff', rimA: 1, dx: -5, dy: 6 });
  ctx.fillStyle = vgrad(ctx, 1330, H, [[0, 'rgba(3,6,11,0)'], [.2, '#03060b'], [1, '#020409']]); ctx.fillRect(0, 1330, W, H - 1330);
  dust(ctx, t, 50, 93, [0, 300, W, 1200], '#bcd2ff', 1.6, .35, 4);
  if (OLIVES) ctx.drawImage(OLIVES[2], -200 - pan * 1.1, 760 - 1900);
}
function jardimClose(ctx, t) {
  const lt = t - JA_CLOSE;
  fillBg(ctx, [[0, '#050a16'], [.5, '#0b1730'], [1, '#03060c']]);
  glow(ctx, 260, 260, 700, '#7f9fe0', .3);
  // cálice translúcido
  const ca = win(t, JA_CLOSE + .2, JA_KISS, .8, .5) * (.75 + .25 * Math.sin(t * 2));
  if (ca > 0) { ctx.save(); ctx.globalAlpha = ca * .55; glow(ctx, 250, 470, 230, '#e8c47a', .5); iconChalice(ctx, 250, 470, 1.3, '#f0d08a'); ctx.restore(); }
  const k = 1 + E.out(clamp(lt / 7)) * .06;
  ctx.save(); ctx.translate(560, 1000); ctx.scale(k, k); ctx.translate(-560, -1000);
  const face = place(faceProfileUnit(), 230, 380, 1.08, { rot: 14 });
  shade(ctx, face, { fill: '#060a14', rim: '#d6e4ff', rimA: 1, dx: 7, dy: 6, rim2: '#3b5a9a', rim2A: .5, dx2: 4, dy2: 0 });
  // pálpebra fechada
  ctx.save(); ctx.translate(230, 380); ctx.rotate(14 * Math.PI / 180); ctx.scale(1.08, 1.08);
  ctx.save(); ctx.clip(faceProfileUnit());
  ctx.lineCap = 'round';
  for (let i = 0; i < 16; i++) { // mechas do cabelo
    const ox = 470 + i * 22, sw = Math.sin(t * .8 + i) * 6;
    ctx.strokeStyle = `rgba(120,150,210,${.10 + (i % 3) * .05})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(ox - 60, 170 + i * 4); ctx.bezierCurveTo(ox + 40, 320, ox + 30 + sw, 620, ox + 120 + sw, 1050); ctx.stroke();
  }
  for (let i = 0; i < 9; i++) { // barba
    ctx.strokeStyle = 'rgba(120,150,210,.14)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(300 + i * 14, 690 + i * 6); ctx.quadraticCurveTo(310 + i * 16, 760, 335 + i * 12, 815); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(170,195,240,.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(318, 478); ctx.quadraticCurveTo(345, 492, 372, 480); ctx.stroke();
  ctx.strokeStyle = 'rgba(170,195,240,.25)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(330, 440); ctx.quadraticCurveTo(360, 432, 392, 446); ctx.stroke();
  // gotas descendo
  for (let i = 0; i < 4; i++) {
    const ph = ((lt * .35 + i * .27) % 1);
    const gx = [336, 352, 318, 370][i], gy = 330 + ph * 380 + i * 18;
    const ga = Math.sin(ph * Math.PI);
    ctx.fillStyle = `rgba(215,230,255,${.75 * ga})`; ctx.beginPath(); ctx.ellipse(gx, gy, 4, 7, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
  ctx.restore();
  dust(ctx, t, 40, 95, [0, 0, W, H], '#bcd2ff', 1.6, .3, 4);
}
function jardimKiss(ctx, t) {
  const lt = t - JA_KISS;
  fillBg(ctx, [[0, '#040812'], [.55, '#0d1830'], [1, '#030509']]);
  if (OLIVES) { ctx.drawImage(OLIVES[0], -260, 1180 - 1700); ctx.drawImage(OLIVES[1], -120, 1280 - 1700); }
  // tochas se aproximando
  for (let i = 0; i < 6; i++) {
    const x = 120 + i * 160 + noise1(t * .5 + i, 7) * 20, y = 930 + rnd(i, 97) * 70 - lt * 6;
    const f = .7 + .3 * noise1(t * 9 + i * 3, 8);
    glow(ctx, x, y, 140 * f, '#ff8a2a', .35); glow(ctx, x, y, 30, '#ffd08a', .9 * f);
  }
  ctx.fillStyle = vgrad(ctx, 1250, H, [[0, '#0a1222'], [1, '#020408']]); ctx.fillRect(0, 1260, W, H - 1260);
  const lean = E.inOut(inv(JA_KISS + .3, ws('s18', 'beijo') + .4, t));
  const A = place(robedSideUnit({ arm: 'embrace' }), 470 + lean * 22, 1290, 640, { rot: lean * 7 });
  const B = place(robedSideUnit({ hood: false, arm: 'swing' }), 640, 1290, 660, { flip: true });
  shade(ctx, B, { fill: '#05080e', rim: '#cfe0ff', rimA: .9, dx: -5, dy: 5, rim2: '#ff9a45', rim2A: .7, dx2: 6, dy2: 0 });
  shade(ctx, A, { fill: '#05070b', rim: '#ff9a45', rimA: .9, dx: 5, dy: 5 });
  dust(ctx, t, 40, 99, [0, 600, W, 800], '#ffb878', 1.5, .3, 10);
}
function jardimScene(ctx, t) {
  if (t < JA_CLOSE) jardimWide(ctx, t);
  else if (t < JA_KISS) jardimClose(ctx, t);
  else jardimKiss(ctx, t);
  // pequenos fades nos cortes internos
  [JA_CLOSE, JA_KISS].forEach(c => { const d = 1 - Math.abs(t - c) / .25; if (d > 0) { ctx.save(); ctx.fillStyle = '#000'; ctx.globalAlpha = d; ctx.fillRect(0, 0, W, H); ctx.restore(); } });
  refTag(ctx, 'Mateus 26:36-46', W / 2, 260, win(t, SEN.s17.start, JA_KISS, .5, .3));
  label(ctx, 'GETSÊMANI', W / 2, 340, win(t, SEN.s17.start, JA_KISS, .5, .3) * .9, '#bcd2ff', 26, 12);
  refTag(ctx, 'Lucas 22:47-48', W / 2, 260, win(t, JA_KISS + .2, JA_B, .4, .3));
}
SCENES.push({ id: 'jardim', a: JA_A, b: JA_B, tin: 'dip', capY: 1480, draw: jardimScene });

// ---------------- 3e: não é um tribunal ----------------
const TB_A = SEN.s19.start - .3, TB_B = SEN.s20.start + .35;
const STAMPS = [['SÉC. I', 220, 520, -.12], ['SÉC. IV', 820, 640, .1], ['SÉC. XIII', 250, 1460, .08], ['SÉC. XXI', 830, 1300, -.09], ['SÉC. XVII', 560, 420, .05]];
function tribunalScene(ctx, t) {
  const lt = t - TB_A;
  fillBg(ctx, [[0, '#08080a'], [.5, '#111014'], [1, '#050506']]);
  const dis = tw(t, SEN.s19.end + .1, TB_B, E.inOut);
  glow(ctx, W / 2, 1000, 600, '#8fa6cc', .16 + dis * .2);
  // Judas pequeno no centro
  const jp = place(robedFrontUnit({ pose: 'down' }), W / 2, 1330, 520);
  shade(ctx, jp, { fill: '#07090d', rim: '#c9dcff', rimA: .8 + dis * .2, dx: 0, dy: 5 });
  ctx.fillStyle = '#000'; ctx.fill(place(hoodFaceUnit(), W / 2, 1330, 520));
  // martelo descendo e congelando
  const tT = ws('s19', 'tribunal');
  const rot = lerp(-.95, -.06, E.out(inv(tT - .6, tT + .35, t))) + Math.sin(t * 40) * .004 * win(t, tT + .3, tT + 1.2, .1, .3);
  const ga = (1 - dis) * tw(t, TB_A, TB_A + .5);
  if (ga > 0) {
    ctx.save(); ctx.globalAlpha = ga; ctx.translate(930, 620); ctx.rotate(rot);
    const gp = place(gavelUnit(), -370, 0, 260, { rot: -90 });
    shade(ctx, gp, { fill: '#1a120c', rim: '#d8b892', rimA: .8, dx: 0, dy: 5 });
    ctx.restore();
  }
  // carimbos dos séculos
  const tO = ws('s19', 'ordem');
  STAMPS.forEach(([s, x, y, r], i) => {
    const t0 = tO + i * .32; const a = tw(t, t0, t0 + .12, E.out) * (1 - dis);
    if (a <= 0) return;
    const k = lerp(1.8, 1, E.out(inv(t0, t0 + .15, t)));
    ctx.save(); ctx.globalAlpha = a * .9; ctx.translate(x + (rnd(i, 7) - .5) * dis * 200, y - dis * 120); ctx.rotate(r); ctx.scale(k, k);
    ctx.strokeStyle = C.blood; ctx.lineWidth = 6; roundRect(ctx, -150, -70, 300, 140, 10); ctx.stroke();
    text(ctx, 'CULPADO', 0, -12, F.disp(62), C.blood, { ls: 4 });
    text(ctx, s, 0, 40, F.sans(26, 800), C.blood, { ls: 6 });
    ctx.globalCompositeOperation = 'destination-out';
    for (let j = 0; j < 40; j++) { ctx.beginPath(); ctx.arc((rnd(j, i + 1) - .5) * 300, (rnd(j, i + 9) - .5) * 140, 1 + rnd(j, i + 3) * 4, 0, TAU); ctx.fill(); }
    ctx.restore();
  });
  // dissolução em poeira
  if (dis > 0) dust(ctx, t, 120, 101, [0, 300, W, 1300], '#e0b8a0', 2.4, (1 - dis) * .9 + .1, 120);
}
SCENES.push({ id: 'tribunal', a: TB_A, b: TB_B, tin: 'fade', capY: 1520, draw: tribunalScene });
