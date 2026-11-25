// ===== Cenas 4, 5 e 6: a inversão, pais e filhos, fechamento =====
window.SCENES = window.SCENES || [];

function heart(ctx, x, y, s, color, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -40, -60, 0, -30); ctx.bezierCurveTo(40, -60, 60, -10, 0, 30); ctx.fill(); ctx.restore();
}
// painel (metade da tela) com recorte
function panel(ctx, y0, y1, dim, draw) {
  ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, y1 - y0); ctx.clip();
  draw();
  if (dim > 0) { ctx.fillStyle = `rgba(0,0,0,${dim})`; ctx.fillRect(0, y0, W, y1 - y0); }
  ctx.restore();
}
function divider(ctx, t, y, a, col = C.amber) {
  ctx.save();
  ctx.fillStyle = vgrad(ctx, y - 120, y + 120, [[0, 'rgba(0,0,0,0)'], [.5, 'rgba(0,0,0,.75)'], [1, 'rgba(0,0,0,0)']]);
  ctx.fillRect(0, y - 120, W, 240);
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, rgba(col, 0)); g.addColorStop(.5, rgba(col, .9 * a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.fillRect(0, y - 1.5, W, 3);
  ctx.restore();
}
function pairLabel(ctx, x, y, top, big, color, a, icon) {
  if (a <= 0) return;
  label(ctx, top, x, y, a, C.steel, 24, 8);
  const k = lerp(.8, 1, E.back(clamp(a)));
  ctx.save(); ctx.translate(x, y + 62); ctx.scale(k, k);
  text(ctx, big, 0, 0, F.disp(68), color, { ls: 3, alpha: a, shadow: rgba(color, .45), blur: 26 });
  ctx.restore();
  if (icon) icon(x, y + 150, a);
}

// ---------------- CENA 4: A INVERSÃO ----------------
const IV_A = SEN.s20.start - .35, IV_B = SEN.s29.start + .3;
const MID = 960;
function inversaoScene(ctx, t) {
  const appear = tw(t, IV_A, SEN.s20.start + .6);
  const focusTop = SEN.s21.start - .2, focusBot = SEN.s26.start - .2;
  const dimTop = t < focusBot ? 0 : t < SEN.s27.start ? .55 : t < SEN.s28.start - .1 ? 0 : .55;
  const dimBot = t < focusTop ? 0 : t < focusBot ? .6 : t < SEN.s27.start ? 0 : t < SEN.s28.start - .1 ? .6 : 0;
  const dT = lerp(0, dimTop, 1), dB = dimBot;
  fillBg(ctx, [[0, '#040508'], [1, '#040508']]);
  // ---- topo: PEDRO ----
  panel(ctx, 0, MID, dT, () => {
    fillBg(ctx, [[0, '#0c0f18'], [.45, '#141826'], [.5, '#0a0c12'], [1, '#050608']]);
    const GY = 790;
    glow(ctx, 960, GY - 160, 380, '#ffcf8a', .3);
    ctx.fillStyle = vgrad(ctx, GY, MID, [[0, '#1b1d26'], [1, '#08090c']]); ctx.fillRect(0, GY, W, MID - GY);
    ctx.fillStyle = 'rgba(200,180,150,.35)'; ctx.fillRect(0, GY - 2, W, 3);
    cross(ctx, 960, GY - 120, 240, '#0b0a0c', 1);
    ctx.save(); ctx.clip(crossPath(960, GY - 120, 240)); glow(ctx, 960, GY - 220, 160, '#ffcf8a', .5); ctx.restore();
    // Jesus caminhando para a cruz
    const jw = inv(SEN.s20.start, SEN.s21.start + 1.6, t);
    const jx = lerp(110, 330, E.out(jw));
    const jp = place(robedSideUnit({ phase: t * 6, walk: jw < 1 ? .8 : 0 }), jx, GY, 330);
    shade(ctx, jp, { fill: '#07080c', rim: '#ffcf8a', rimA: .9, dx: 5, dy: 4 });
    // Pedro barrando o caminho
    const pa = tw(t, SEN.s21.start - .2, SEN.s21.start + .5);
    const raise = .5 + .5 * Math.sin(t * 3) * win(t, SEN.s21.start, SEN.s22.start, .3, .3);
    const pp = place(robedFrontUnit({ hood: false, pose: 'spread', raise }), 620, GY, 360);
    shade(ctx, pp, { fill: '#07080c', rim: '#d8e4ff', rimA: .9, dx: 0, dy: 5, alpha: pa, rim2: '#ffcf8a', rim2A: .6, dx2: -5, dy2: 0 });
    // pedra de tropeço
    const tS = ws('s25', 'pedra');
    const sp = inv(tS - .35, tS + .05, t);
    if (sp > 0) {
      const sy = lerp(-200, GY - 46, E.in(sp)) + (sp >= 1 ? Math.abs(Math.sin((t - tS - .05) * 18)) * 12 * Math.exp(-(t - tS) * 6) : 0);
      const rk = new Path2D(); rk.moveTo(-70, 40); rk.lineTo(-62, -20); rk.lineTo(-20, -48); rk.lineTo(40, -40); rk.lineTo(72, 0); rk.lineTo(66, 42); rk.closePath();
      ctx.save(); ctx.translate(470, sy); shade(ctx, rk, { fill: '#2a2a30', rim: '#e0e4ee', rimA: .7, dx: 0, dy: 5 }); ctx.restore();
      if (sp >= 1) dust(ctx, t, 30, 301, [380, GY - 90, 180, 90], '#d8d0c0', 2.2, .5 * (1 - inv(tS, tS + 1.5, t)), 40);
      label(ctx, 'PEDRA DE TROPEÇO', 470, GY + 70, win(t, tS + .1, SEN.s26.start, .3, .4), '#e6d6c0', 24, 6);
    }
    // títulos
    text(ctx, 'PEDRO', W / 2, 130, F.disp(72), C.bone, { ls: 10, alpha: appear });
    refTag(ctx, 'Mateus 16:21-23', W / 2, 200, appear * win(t, SEN.s21.start - .3, SEN.s26.start, .5, .5), { size: 38 });
    // intenção x efeito
    pairLabel(ctx, 230, 280, 'INTENÇÃO', 'CUIDADO', '#ff8fa0', tw(t, ws('s22', 'intencao') - .1, ws('s22', 'intencao') + .4) * (1 - dT) * (1 - tw(t, SEN.s27.start - .3, SEN.s27.start)),
      (x, y, a) => heart(ctx, x, y + 6, 70, '#ff8fa0', a));
    pairLabel(ctx, 850, 280, 'EFEITO', 'BLOQUEIO', C.blood, tw(t, ws('s23', 'efeito') - .1, ws('s23', 'efeito') + .4) * (1 - dT) * (1 - tw(t, SEN.s27.start - .3, SEN.s27.start)),
      (x, y, a) => padlock(ctx, x, y + 20, 66, a, C.blood));
    // cadeado grande sobre o caminho
    const la = win(t, ws('s23', 'impediria') - .2, SEN.s26.start, .3, .4);
    if (la > 0) { const k = lerp(1.6, 1, E.out(inv(ws('s23', 'impediria') - .2, ws('s23', 'impediria') + .2, t))); glow(ctx, 790, GY - 120, 150, C.blood, .3 * la); padlock(ctx, 790, GY - 120, 110 * k, la, C.blood); }
  });
  // ---- base: JUDAS ----
  panel(ctx, MID, H, dB, () => {
    fillBg(ctx, [[0, '#050608'], [.5, '#0a0c12'], [.55, '#0d1018'], [1, '#040506']]);
    const GY = 1690;
    glow(ctx, 960, GY - 160, 380, '#ffcf8a', .3 + win(t, SEN.s26.start, SEN.s27.start, .5, .5) * .3);
    // engrenagem
    const boost = E.inOut(inv(SEN.s26.start, SEN.s28.end, t)) * 6;
    const rot = t * .25 + boost;
    gear(ctx, 700, 1610, 95, 9, -rot * 210 / 95 + .2, { c1: '#5a4a36', c2: '#241c14', c3: '#7a6448', edge: 'rgba(255,210,150,.35)' });
    gear(ctx, 540, 1470, 210, 14, rot, { c1: '#5a4a36', c2: '#241c14', c3: '#7a6448', edge: 'rgba(255,210,150,.35)' });
    ctx.fillStyle = vgrad(ctx, GY, H, [[0, '#1b1d26'], [1, '#08090c']]); ctx.fillRect(0, GY, W, H - GY);
    ctx.fillStyle = 'rgba(200,180,150,.35)'; ctx.fillRect(0, GY - 2, W, 3);
    cross(ctx, 960, GY - 120, 240, '#0b0a0c', 1);
    ctx.save(); ctx.clip(crossPath(960, GY - 120, 240)); glow(ctx, 960, GY - 220, 160, '#ffcf8a', .5); ctx.restore();
    // Judas caminhando para a entrega
    const jw = inv(SEN.s26.start - .4, SEN.s28.end, t);
    const jx = lerp(100, 760, E.inOut(jw));
    const jp = place(robedSideUnit({ phase: t * 6.5, walk: jw > 0 && jw < 1 ? .9 : 0 }), jx, GY, 300);
    shade(ctx, jp, { fill: '#07080c', rim: '#a9c4ff', rimA: .9, dx: 5, dy: 4, rim2: '#ffcf8a', rim2A: .5, dx2: -4, dy2: 0 });
    text(ctx, 'JUDAS', W / 2, MID + 190, F.disp(72), C.bone, { ls: 10, alpha: appear * tw(t, SEN.s21.start - .3, SEN.s21.start + .3) });
    refTag(ctx, 'João 13:26-30  ·  Mateus 26:14-16', W / 2, MID + 265, appear * win(t, SEN.s26.start - .3, IV_B, .5, .3), { size: 34 });
    pairLabel(ctx, 210, MID + 300, 'INTENÇÃO', 'TRAIÇÃO', C.blood, tw(t, ws('s26', 'traindo') - .1, ws('s26', 'traindo') + .4) * (1 - tw(t, SEN.s28.start - .3, SEN.s28.start)),
      null);
    pairLabel(ctx, 870, MID + 300, 'EFEITO', 'AVANÇO', C.gold, tw(t, ws('s26', 'acelera') - .1, ws('s26', 'acelera') + .4) * (1 - tw(t, SEN.s28.start - .3, SEN.s28.start)), null);
  });
  divider(ctx, t, MID, appear);
  // título e frases de inversão
  const ta = win(t, SEN.s20.start - .2, SEN.s21.start - .1, .4, .3);
  if (ta > 0) { ctx.save(); ctx.globalAlpha = ta; ctx.fillStyle = '#000'; ctx.fillRect(0, MID - 90, W, 180); ctx.restore(); text(ctx, 'A INVERSÃO', W / 2, MID, F.disp(110), C.gold, { ls: 12, alpha: ta, shadow: rgba(C.amber, .5), blur: 40 }); }
  const swap = (y, a1, b1, w1, w2, c1, c2, tA, tB) => {
    const a = win(t, tA, tB, .3, .3); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a * .8; ctx.fillStyle = '#000'; ctx.fillRect(0, y - 120, W, 240); ctx.restore();
    const p = tw(t, tA + .5, tA + 1.1);
    text(ctx, w1, W / 2, y - 50 * p, F.disp(96), c1, { ls: 4, alpha: a * (1 - .6 * p) });
    if (p > 0) { text(ctx, w2, W / 2, y + 60 * p, F.disp(110), c2, { ls: 4, alpha: a * p, shadow: rgba(c2, .5), blur: 30 }); }
    ctx.save(); ctx.globalAlpha = a * (1 - p) * 0; ctx.restore();
  };
  swap(400, 0, 0, 'PROTEÇÃO', 'OBSTÁCULO', '#ff8fa0', C.blood, SEN.s27.start - .1, SEN.s28.start - .1);
  swap(1440, 0, 0, 'RUÍNA', 'PROCESSO', C.blood, C.gold, SEN.s28.start - .1, IV_B);
}
SCENES.push({ id: 'inversao', a: IV_A, b: IV_B, tin: 'fade', capY: t => t < SEN.s21.start - .1 ? MID + 150 : MID, draw: inversaoScene });

// ---------------- CENA 5: PAIS E FILHOS ----------------
const PA_A = SEN.s29.start - .3, PA_B = SEN.s35.start + .4;
function paisScene(ctx, t) {
  fillBg(ctx, [[0, '#050608'], [1, '#050608']]);
  const intro = 1 - tw(t, SEN.s30.start - .5, SEN.s30.start);
  const split = tw(t, SEN.s30.start - .6, SEN.s30.start);
  const dimTop = t < SEN.s32.start - .2 ? 0 : t < SEN.s33.start - .1 ? .6 : t < SEN.s34.start - .1 ? 0 : .6;
  const dimBot = t < SEN.s32.start - .2 ? .6 : t < SEN.s33.start - .1 ? 0 : t < SEN.s34.start - .1 ? .6 : 0;
  if (intro > 0) {
    ctx.save(); ctx.globalAlpha = intro;
    fillBg(ctx, [[0, '#07080c'], [.6, '#141019'], [1, '#050506']]);
    glow(ctx, W / 2, 1000, 600, '#ffcf8a', .22);
    const adult = place(robedFrontUnit({ hood: false, pose: 'down' }), 470, 1300, 640);
    const kid = place(robedFrontUnit({ hood: false, pose: 'down' }), 650, 1300, 400);
    shade(ctx, adult, { fill: '#08080b', rim: '#ffd6a0', rimA: .9, dx: 0, dy: 5 });
    shade(ctx, kid, { fill: '#08080b', rim: '#ffd6a0', rimA: .9, dx: 0, dy: 5 });
    ctx.strokeStyle = '#08080b'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(530, 1010); ctx.quadraticCurveTo(570, 1060, 610, 1060); ctx.stroke();
    text(ctx, 'PAIS E FILHOS', W / 2, 480, F.disp(104), C.bone, { ls: 8, alpha: tw(t, SEN.s29.start, SEN.s29.start + .6), shadow: 'rgba(255,200,140,.3)', blur: 30 });
    ctx.restore();
  }
  if (split <= 0) return;
  ctx.save(); ctx.globalAlpha = split;
  // ---- topo: a redoma ----
  panel(ctx, 0, MID, dimTop, () => {
    fillBg(ctx, [[0, '#0a0c12'], [.5, '#121521'], [1, '#07080b']]);
    const by = 800;
    glow(ctx, W / 2, 560, 420, '#9fc0ff', .18);
    ctx.fillStyle = '#1a140f'; ctx.beginPath(); ctx.ellipse(W / 2, by + 6, 300, 34, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2a1e14'; ctx.beginPath(); ctx.ellipse(W / 2, by - 4, 110, 22, 0, 0, TAU); ctx.fill();
    const g = inv(SEN.s30.start, ws('s31', 'evoluir') + .5, t);
    const hit = clamp((g - .55) / .45);
    sprout(ctx, W / 2, by - 6, Math.min(1.62, .25 + g * 1.45), hit * 1.2, t, '#86c46e');
    const drop = E.out(inv(ws('s30', 'medo') - .5, ws('s30', 'medo') + .4, t));
    bellJar(ctx, W / 2, lerp(330, by + 4, drop), 380, 430, 1);
    if (hit > .2) glow(ctx, W / 2 + 40, by - 420, 70, '#cfe2ff', .4 * hit);
    // pai protetor ao lado
    const pf = place(robedFrontUnit({ hood: false, pose: 'clasp' }), 210, by + 10, 420);
    shade(ctx, pf, { fill: '#08090d', rim: '#bcd2ff', rimA: .8, dx: 0, dy: 5 });
    label(ctx, 'A REDOMA', W / 2, 170, 1, C.steel, 30, 12);
  });
  // ---- base: a porta aberta ----
  panel(ctx, MID, H, dimBot, () => {
    fillBg(ctx, [[0, '#07060a'], [.5, '#120e0c'], [1, '#050404']]);
    const DX = 560, DY0 = 1170, DY1 = 1730, DW = 360;
    const open = E.inOut(inv(ws('s32', 'empurra') - .3, ws('s32', 'conforto') + .3, t));
    // lá fora: estrada aberta ao amanhecer
    ctx.save(); ctx.beginPath(); ctx.rect(DX - DW / 2, DY0, DW, DY1 - DY0); ctx.clip();
    ctx.fillStyle = vgrad(ctx, DY0, DY1, [[0, '#2a3b5c'], [.55, '#e9a868'], [.62, '#5a4636'], [1, '#2a2018']]); ctx.fillRect(DX - DW / 2, DY0, DW, DY1 - DY0);
    glow(ctx, DX, DY0 + 330, 200, '#ffe2b0', .7);
    ctx.fillStyle = '#3a2c22'; ctx.beginPath(); ctx.moveTo(DX - 8, DY0 + 352); ctx.lineTo(DX + 8, DY0 + 352); ctx.lineTo(DX + 160, DY1); ctx.lineTo(DX - 160, DY1); ctx.fill();
    ctx.strokeStyle = 'rgba(255,230,190,.6)'; ctx.setLineDash([18, 18]); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(DX, DY0 + 356); ctx.lineTo(DX, DY1); ctx.stroke(); ctx.setLineDash([]);
    // jovem saindo pela estrada
    const wk = inv(ws('s32', 'duro') - .2, SEN.s33.start + 1, t);
    if (wk > 0) {
      const sc = lerp(260, 110, E.out(wk)), yy = lerp(DY1 - 10, DY0 + 420, E.out(wk));
      const yp = place(robedSideUnit({ phase: t * 7, walk: .8 }), DX + 10, yy, sc, { flip: false, rot: -2 });
      shade(ctx, yp, { fill: '#120c08', rim: '#ffe2b0', rimA: .8, dx: 0, dy: 4 });
    }
    ctx.restore();
    // folha da porta abrindo para dentro
    const dw = DW * (1 - open * .82);
    ctx.fillStyle = vgrad(ctx, DY0, DY1, [[0, '#3a2616'], [1, '#1e140b']]);
    ctx.beginPath(); ctx.moveTo(DX - DW / 2, DY0); ctx.lineTo(DX - DW / 2 + dw, DY0 - open * 40); ctx.lineTo(DX - DW / 2 + dw, DY1 + open * 40); ctx.lineTo(DX - DW / 2, DY1); ctx.fill();
    ctx.fillStyle = '#c9a36b'; ctx.beginPath(); ctx.arc(DX - DW / 2 + dw - 26, (DY0 + DY1) / 2, 7, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2b1c10'; ctx.lineWidth = 18; ctx.strokeRect(DX - DW / 2 - 9, DY0 - 9, DW + 18, DY1 - DY0 + 9);
    // luz e vento entrando
    if (open > 0) {
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = open * .5;
      ctx.fillStyle = vgrad(ctx, DY1, H, [[0, 'rgba(255,200,140,.6)'], [1, 'rgba(255,200,140,0)']]);
      ctx.beginPath(); ctx.moveTo(DX - DW / 2, DY1); ctx.lineTo(DX + DW / 2, DY1); ctx.lineTo(DX + 520, H); ctx.lineTo(DX - 520, H); ctx.fill(); ctx.restore();
      ctx.save(); ctx.strokeStyle = 'rgba(255,230,200,.35)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 14; i++) {
        const ph = ((t * .9 + rnd(i, 401)) % 1), y = DY0 + 60 + rnd(i, 402) * 520, x = lerp(DX + 40, 1150, ph);
        ctx.globalAlpha = open * Math.sin(ph * Math.PI) * .8;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 14 + Math.sin(t * 3 + i) * 10, x + 140, y + 4); ctx.stroke();
      }
      for (let i = 0; i < 10; i++) { // folhas
        const ph = ((t * .5 + rnd(i, 403)) % 1), x = lerp(DX, 1120, ph), y = DY0 + 100 + rnd(i, 404) * 460 + Math.sin(t * 4 + i) * 30;
        ctx.globalAlpha = open * Math.sin(ph * Math.PI);
        ctx.save(); ctx.translate(x, y); ctx.rotate(t * 3 + i); ctx.fillStyle = i % 2 ? '#c9893a' : '#8fae5a'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 6, 0, 0, TAU); ctx.fill(); ctx.restore();
      }
      ctx.restore();
    }
    // quem abre a porta
    const op = place(robedSideUnit({ arm: 'forward' }), DX - DW / 2 - 70, DY1, 470, { flip: false });
    shade(ctx, op, { fill: '#0a0807', rim: '#ffd6a0', rimA: .9 * open + .3, dx: 4, dy: 4 });
    label(ctx, 'A PORTA ABERTA', W / 2, MID + 150, 1, C.steel, 30, 12);
  });
  divider(ctx, t, MID, 1);
  ctx.restore();
}
SCENES.push({ id: 'pais', a: PA_A, b: PA_B, tin: 'fade', capY: t => t < SEN.s30.start - .3 ? 1400 : MID, draw: paisScene });

// ---------------- CENA 6: FECHAMENTO ----------------
const FI_A = SEN.s35.start - .4, FI_B = TM.duration + .1;
function finalScene(ctx, t) {
  const merge = E.inOut(inv(SEN.s35.start, SEN.s35.end, t));
  const dawn = tw(t, SEN.s35.start, SEN.s36.end + 2);
  fillBg(ctx, [[0, '#04050a'], [.55, '#0d0f18'], [.75, '#241c1e'], [.76, '#0a0a0e'], [1, '#040405']]);
  const HY = 1480;
  glow(ctx, W / 2, HY, 700 + dawn * 500, '#ffbf7a', .25 + dawn * .45);
  glow(ctx, W / 2, HY, 200 + dawn * 120, '#fff1d6', .4 + dawn * .5);
  // raios de luz
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + (i - 5.5) * .2 + Math.sin(t * .2 + i) * .02;
    ctx.globalAlpha = dawn * .12 * (.5 + .5 * noise1(t * .3 + i, 4));
    ctx.fillStyle = '#ffd9a8'; ctx.beginPath(); ctx.moveTo(W / 2, HY);
    ctx.lineTo(W / 2 + Math.cos(a - .03) * 1600, HY + Math.sin(a - .03) * 1600); ctx.lineTo(W / 2 + Math.cos(a + .03) * 1600, HY + Math.sin(a + .03) * 1600); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = vgrad(ctx, HY, H, [[0, '#120e0c'], [1, '#030303']]); ctx.fillRect(0, HY, W, H - HY);
  ctx.fillStyle = rgba('#ffd9a8', .5 + dawn * .4); ctx.fillRect(0, HY - 1, W, 2);
  // as duas metades se unindo numa engrenagem
  const rot = t * .35;
  const gy = 1270, R = 240;
  if (merge < 1) {
    ctx.save(); ctx.globalAlpha = 1 - merge;
    padlock(ctx, W / 2, lerp(470, gy, merge), 130, 1, C.blood);
    gear(ctx, W / 2, lerp(1560, gy, merge), 150, 10, rot, { c1: '#5a4a36', c2: '#241c14', c3: '#7a6448' });
    ctx.restore();
    divider(ctx, t, lerp(MID, gy, merge), 1 - merge);
  }
  const ga = tw(t, SEN.s35.start + 1.2, SEN.s35.end + .3);
  if (ga > 0) {
    ctx.save(); ctx.globalAlpha = ga;
    glow(ctx, W / 2, gy, R * 2.1, '#ffbf7a', .25);
    const k = lerp(.6, 1, E.out(ga));
    ctx.translate(W / 2, gy); ctx.scale(k, k); ctx.translate(-W / 2, -gy);
    gear(ctx, W / 2, gy, R, 16, rot, { c1: '#6a5640', c2: '#2a2018', c3: '#8a7050', edge: 'rgba(255,220,170,.55)', edgeW: 3 });
    cross(ctx, W / 2, gy, 150, '#1a120c', 1, .0);
    ctx.save(); ctx.clip(crossPath(W / 2, gy, 150)); glow(ctx, W / 2, gy - 60, 120, '#ffd9a8', .6); ctx.restore();
    ctx.restore();
  }
  dust(ctx, t, 60, 501, [0, 300, W, 1300], '#ffd9a8', 1.8, .3 + dawn * .2, 10);
  // rótulo IMPERDOÁVEL descolando e palavras que ficam
  const tI = ws('s36', 'imperdoavel'), tH = ws('s36', 'humanidade'), tIr = ws('s36', 'ironia'), tP = ws('s36', 'peso');
  const ia = win(t, tI - .15, tH, .15, .6);
  if (ia > 0) {
    const peel = tw(t, tH - .8, tH);
    ctx.save(); ctx.globalAlpha = ia; ctx.translate(W / 2 + peel * 120, 560 + peel * 260); ctx.rotate(-.08 + peel * .5);
    ctx.strokeStyle = C.blood; ctx.lineWidth = 8; roundRect(ctx, -330, -80, 660, 160, 12); ctx.stroke();
    text(ctx, 'IMPERDOÁVEL', 0, 6, F.disp(110), C.blood, { ls: 8 });
    ctx.restore();
  }
  const words = [['HUMANIDADE', tH, 'de quem sofreu', '#e6d6c0'], ['IRONIA', tIr, 'de quem tentou travar o caminho', '#ff8fa0'], ['PESO', tP, 'de quem ficou com a parte mais suja', C.gold]];
  const wOut = SEN.s37.start - .3;
  words.forEach(([w, t0, sub, col], i) => {
    const a = win(t, t0 - .1, wOut, .35, .4); if (a <= 0) return;
    const y = 430 + i * 190;
    const k = lerp(1.3, 1, E.out(inv(t0 - .1, t0 + .3, t)));
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(k, k);
    text(ctx, w, 0, 0, F.disp(108), col, { ls: 8, alpha: a, shadow: rgba(col, .4), blur: 30 });
    ctx.restore();
    text(ctx, sub, W / 2, y + 78, F.serif(44), C.silver, { alpha: a * .9 });
  });
  // E você?
  const ya = win(t, SEN.s37.start - .1, SEN.s38.start + .1, .2, .3);
  if (ya > 0) { const k = lerp(1.5, 1, E.out(inv(SEN.s37.start - .1, SEN.s37.start + .3, t))); ctx.save(); ctx.translate(W / 2, 760); ctx.scale(k, k); text(ctx, 'E VOCÊ?', 0, 0, F.disp(190), '#ffffff', { ls: 8, alpha: ya, shadow: 'rgba(255,200,140,.5)', blur: 40 }); ctx.restore(); }
  // pergunta final, palavra a palavra
  if (t > SEN.s38.start - .2) {
    const parts = [
      { y: 400, font: F.serif(58), col: C.silver },
      { y: 545, big: 'INTENÇÃO', col: '#9fc4ff' },
      { y: 690, font: F.serif(58), col: C.silver },
      { y: 835, big: 'EFEITO', col: C.gold },
      { y: 975, font: F.serif(58), col: C.silver },
    ];
    const ws38 = sentWords('s38');
    // linhas em texto corrido, revelando cada palavra no tempo da fala
    const lines = [[0, 7], [8, 8], [9, 14], [15, 15], [16, 20]];
    lines.forEach(([a, b], li) => {
      const p = parts[li];
      if (p.big) {
        const w = ws38[a]; const ap = E.out(inv(w.s - .05, w.s + .25, t));
        const k = lerp(1.5, 1, E.back(inv(w.s - .05, w.s + .3, t)));
        ctx.save(); ctx.translate(W / 2, p.y); ctx.scale(k, k);
        text(ctx, p.big, 0, 0, F.disp(150), p.col, { ls: 8, alpha: ap, shadow: rgba(p.col, .5), blur: 40 });
        ctx.restore();
      } else {
        const seg = ws38.slice(a, b + 1);
        const full = seg.map(w => w.w).join(' ');
        const totW = measure(ctx, full, p.font);
        let x = W / 2 - totW / 2;
        seg.forEach(w => {
          const ww = measure(ctx, w.w + ' ', p.font);
          const ap = E.out(inv(w.s - .05, w.s + .2, t));
          text(ctx, w.w, x, p.y + (1 - ap) * 12, p.font, p.col, { align: 'left', alpha: ap });
          x += ww;
        });
      }
    });
  }
}
SCENES.push({ id: 'final', a: FI_A, b: FI_B, tin: 'fade', capY: 1600, draw: finalScene });
