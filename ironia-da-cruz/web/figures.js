// ===== Silhuetas e objetos de cena =====

// cápsula afunilada (para braços, galhos)
function capsule(p, x1, y1, r1, x2, y2, r2) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  p.moveTo(x1 + Math.cos(a + Math.PI / 2) * r1, y1 + Math.sin(a + Math.PI / 2) * r1);
  p.arc(x1, y1, r1, a + Math.PI / 2, a + Math.PI * 1.5);
  p.lineTo(x2 + Math.cos(a - Math.PI / 2) * r2, y2 + Math.sin(a - Math.PI / 2) * r2);
  p.arc(x2, y2, r2, a - Math.PI / 2, a + Math.PI / 2);
  p.closePath();
}
function ellipseP(p, x, y, rx, ry, rot = 0) { p.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx); p.ellipse(x, y, rx, ry, rot, 0, TAU); p.closePath(); }
// transforma um Path2D em unidades para pixels
function place(unit, x, y, s, opts = {}) {
  const m = new DOMMatrix().translate(x, y).rotate(opts.rot || 0).scale((opts.flip ? -1 : 1) * s, s);
  const p = new Path2D(); p.addPath(unit, m); return p;
}
// preenchimento com luz de recorte (rim light) do lado de onde vem a luz
function shade(ctx, path, o = {}) {
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.glow) { ctx.save(); ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowBlur || 40; ctx.fillStyle = o.fill || C.robe; ctx.fill(path); ctx.restore(); }
  ctx.fillStyle = o.fill || C.robe; ctx.fill(path);
  if (o.rim) {
    ctx.save(); ctx.clip(path);
    ctx.globalAlpha *= (o.rimA ?? 1);
    ctx.fillStyle = o.rim; ctx.fill(path);
    ctx.globalAlpha = o.alpha ?? 1;
    ctx.translate(o.dx ?? 0, o.dy ?? 6);
    ctx.fillStyle = o.fill || C.robe; ctx.fill(path);
    if (o.rim2) { // rim secundário (outra fonte de luz)
      ctx.translate(-(o.dx ?? 0), -(o.dy ?? 6));
      ctx.globalAlpha = (o.alpha ?? 1) * (o.rim2A ?? .6);
      ctx.fillStyle = o.rim2; ctx.fill(path);
      ctx.globalAlpha = o.alpha ?? 1;
      ctx.translate(o.dx2 ?? 0, o.dy2 ?? 0); ctx.fillStyle = o.fill || C.robe; ctx.fill(path);
    }
    ctx.restore();
  }
  if (o.tint) { // gradiente sutil por cima
    ctx.save(); ctx.clip(path); ctx.fillStyle = o.tint; ctx.fillRect(0, 0, W, H); ctx.restore();
  }
  ctx.restore();
}

// ---------- figura de túnica, frente (unidades: pés em y=0, topo da cabeça em y=-1) ----------
function robedFrontUnit(o = {}) {
  const p = new Path2D();
  const hood = o.hood !== false;
  if (hood) {
    p.moveTo(0, -1.0);
    p.quadraticCurveTo(0.075, -1.0, 0.088, -0.93);
    p.quadraticCurveTo(0.097, -0.86, 0.125, -0.832);
  } else {
    // cabeça com cabelo e barba
    ellipseP(p, 0, -0.925, 0.058, 0.07);
    ellipseP(p, 0, -0.875, 0.045, 0.05); // barba
    p.moveTo(-0.03, -0.86); p.lineTo(0.03, -0.86); p.lineTo(0.035, -0.82); p.lineTo(-0.035, -0.82); p.closePath();
    p.moveTo(0.125, -0.832);
  }
  p.moveTo(hood ? 0.125 : 0.04, hood ? -0.832 : -0.835);
  if (!hood) p.quadraticCurveTo(0.09, -0.835, 0.125, -0.825);
  p.quadraticCurveTo(0.148, -0.812, 0.152, -0.76);
  p.lineTo(0.142, -0.52);
  p.quadraticCurveTo(0.152, -0.26, 0.182, -0.02);
  p.quadraticCurveTo(0, 0.012, -0.182, -0.02);
  p.quadraticCurveTo(-0.152, -0.26, -0.142, -0.52);
  p.lineTo(-0.152, -0.76);
  p.quadraticCurveTo(-0.148, -0.812, -0.125, hood ? -0.832 : -0.825);
  if (hood) {
    p.quadraticCurveTo(-0.097, -0.86, -0.088, -0.93);
    p.quadraticCurveTo(-0.075, -1.0, 0, -1.0);
  } else {
    p.quadraticCurveTo(-0.09, -0.835, -0.04, -0.835);
    p.lineTo(0.04, -0.835);
  }
  p.closePath();
  // braços
  const pose = o.pose || 'down';
  if (pose === 'none') return p;
  armsFrontInto(p, pose, o);
  return p;
}
function armsFrontUnit(pose, o = {}) { const p = new Path2D(); armsFrontInto(p, pose, o); return p; }
function armsFrontInto(p, pose, o = {}) {
  const sh = [[0.128, -0.77], [-0.128, -0.77]];
  let hands = [];
  if (pose === 'down') hands = [[[0.165, -0.6], [0.15, -0.45]], [[-0.165, -0.6], [-0.15, -0.45]]];
  if (pose === 'cupped') hands = [[[0.18, -0.6], [0.045, -0.565]], [[-0.18, -0.6], [-0.045, -0.565]]];
  if (pose === 'spread') { const r = o.raise || 0; hands = [[[0.27, -0.79 - r * .04], [0.41, -0.84 - r * .12]], [[-0.27, -0.79 - r * .04], [-0.41, -0.84 - r * .12]]]; }
  if (pose === 'clasp') hands = [[[0.15, -0.6], [0.02, -0.66]], [[-0.15, -0.6], [-0.02, -0.66]]];
  const sk = o.sleeve || 1;
  hands.forEach(([el, hd], i) => {
    capsule(p, sh[i][0], sh[i][1], 0.04 * sk, el[0], el[1], 0.036 * sk);
    capsule(p, el[0], el[1], 0.036 * sk, hd[0], hd[1], 0.03 * sk * (pose === 'cupped' ? 1.25 : 1));
    if (pose === 'spread') { // mão aberta
      ellipseP(p, hd[0] + Math.sign(hd[0]) * 0.02, hd[1] - 0.012, 0.024, 0.034, Math.sign(hd[0]) * .3);
      for (let f = 0; f < 4; f++) capsule(p, hd[0] + Math.sign(hd[0]) * (0.02 + f * 0.006), hd[1] - 0.03, 0.007, hd[0] + Math.sign(hd[0]) * (0.012 + f * 0.014), hd[1] - 0.075 + Math.abs(f - 1.5) * 0.008, 0.006);
    } else ellipseP(p, hd[0], hd[1], 0.03, 0.026);
  });
  if (pose === 'cupped') ellipseP(p, 0, -0.56, 0.07, 0.026); // mãos em concha
}
// abertura do capuz (rosto em sombra)
function hoodFaceUnit() { const p = new Path2D(); ellipseP(p, 0, -0.912, 0.05, 0.066); return p; }

// ---------- figura de túnica, perfil (virada para a direita) ----------
function robedSideUnit(o = {}) {
  const ph = o.phase ?? 0;           // fase da caminhada (rad)
  const wk = o.walk ?? 0;            // intensidade da caminhada
  const sw = Math.sin(ph) * wk;
  const p = new Path2D();
  p.moveTo(0, -1.0);
  p.quadraticCurveTo(0.055, -0.995, 0.085, -0.935);
  p.lineTo(0.052, -0.905);
  p.quadraticCurveTo(0.045, -0.87, 0.07, -0.835);
  p.quadraticCurveTo(0.105, -0.76, 0.1, -0.64);
  p.quadraticCurveTo(0.094, -0.5, 0.11, -0.3);
  p.quadraticCurveTo(0.12 + sw * 0.03, -0.12, 0.13 + sw * 0.05, -0.02);
  p.quadraticCurveTo(0.01, 0.008, -0.105 - sw * 0.03, -0.015);
  p.quadraticCurveTo(-0.1, -0.2, -0.088, -0.42);
  p.quadraticCurveTo(-0.082, -0.6, -0.095, -0.74);
  p.quadraticCurveTo(-0.1, -0.86, -0.075, -0.94);
  p.quadraticCurveTo(-0.045, -1.0, 0, -1.0);
  p.closePath();
  // pés
  ellipseP(p, 0.11 + sw * 0.07, -0.008, 0.045, 0.016);
  ellipseP(p, -0.05 - sw * 0.06, -0.008, 0.04, 0.014);
  // braço
  const arm = o.arm || 'swing';
  if (arm === 'swing') {
    const hx = 0.03 - sw * 0.09, hy = -0.5 + Math.abs(sw) * 0.02;
    capsule(p, 0.0, -0.78, 0.038, hx * .6, -0.62, 0.034);
    capsule(p, hx * .6, -0.62, 0.034, hx, hy, 0.03);
    ellipseP(p, hx, hy, 0.028, 0.026);
  } else if (arm === 'forward') { // braço estendido para frente (oferecer/receber)
    capsule(p, 0.0, -0.78, 0.038, 0.12, -0.66, 0.034);
    capsule(p, 0.12, -0.66, 0.034, 0.2, -0.68, 0.028);
    ellipseP(p, 0.215, -0.68, 0.03, 0.022);
  } else if (arm === 'embrace') {
    capsule(p, 0.0, -0.78, 0.038, 0.12, -0.7, 0.034);
    capsule(p, 0.12, -0.7, 0.034, 0.17, -0.8, 0.028);
  }
  return p;
}

// ---------- figura ajoelhada em oração (perfil virado para a esquerda) ----------
function kneelingUnit(bow = 0) {
  // base: joelhos em (0,0); altura total ~0.7
  const p = new Path2D();
  p.moveTo(-0.16, 0);                   // joelho/frente
  p.quadraticCurveTo(-0.17, -0.1, -0.12, -0.2);   // coxa dobrada
  p.quadraticCurveTo(-0.1, -0.3, -0.115, -0.42);  // frente do peito
  p.quadraticCurveTo(-0.12, -0.5, -0.14 - bow * .02, -0.55);
  // cabeça inclinada (capuz abaixado, cabelo)
  p.quadraticCurveTo(-0.19 - bow * .03, -0.56, -0.2 - bow * .04, -0.6 + bow * .02);
  p.quadraticCurveTo(-0.21 - bow * .04, -0.67, -0.16 - bow * .02, -0.7);
  p.quadraticCurveTo(-0.1, -0.72, -0.07, -0.66);
  p.quadraticCurveTo(-0.03, -0.6, -0.01, -0.52);   // nuca e costas
  p.quadraticCurveTo(0.05, -0.38, 0.06, -0.2);
  p.quadraticCurveTo(0.12, -0.12, 0.16, 0);        // pés / manto atrás
  p.closePath();
  // braços até as mãos unidas sobre a rocha
  capsule(p, -0.09, -0.5, 0.035, -0.2, -0.43, 0.03);
  capsule(p, -0.2, -0.43, 0.03, -0.27, -0.47, 0.026);
  ellipseP(p, -0.285, -0.48, 0.03, 0.035, -0.4);
  return p;
}

// ---------- perfil de rosto em close (virado para a esquerda), caixa ~ 1000x1100 ----------
function faceProfileUnit() {
  const p = new Path2D();
  p.moveTo(540, 150);
  p.bezierCurveTo(430, 150, 350, 210, 330, 300);   // testa / linha do cabelo
  p.bezierCurveTo(315, 350, 312, 395, 300, 425);   // sobrancelha
  p.bezierCurveTo(296, 440, 306, 452, 312, 462);   // órbita
  p.bezierCurveTo(300, 500, 270, 530, 248, 566);   // dorso do nariz
  p.bezierCurveTo(240, 580, 252, 592, 272, 590);   // ponta
  p.bezierCurveTo(285, 589, 296, 594, 300, 600);   // base do nariz
  p.bezierCurveTo(296, 612, 286, 618, 288, 628);   // lábio superior
  p.bezierCurveTo(294, 636, 300, 638, 300, 640);
  p.bezierCurveTo(292, 648, 288, 656, 296, 668);   // lábio inferior
  p.bezierCurveTo(300, 676, 296, 684, 292, 692);   // barba começa
  p.bezierCurveTo(276, 730, 285, 780, 330, 818);   // barba frente
  p.bezierCurveTo(360, 842, 400, 838, 430, 826);   // barba embaixo
  p.bezierCurveTo(450, 860, 455, 930, 450, 1000);  // pescoço
  p.bezierCurveTo(420, 1040, 330, 1070, 260, 1120); // ombro frente
  p.lineTo(260, 1300); p.lineTo(1000, 1300); p.lineTo(1000, 1100);
  p.bezierCurveTo(900, 1000, 820, 900, 780, 760);   // cabelo longo atrás
  p.bezierCurveTo(740, 620, 720, 470, 690, 330);
  p.bezierCurveTo(660, 210, 610, 150, 540, 150);
  p.closePath();
  return p;
}

// ---------- busto sentado (ceia) ----------
function bustUnit(o = {}) {
  const p = new Path2D();
  const hood = !!o.hood;
  // ombros
  p.moveTo(-0.5, 0.6); p.quadraticCurveTo(-0.48, 0.05, -0.2, -0.02);
  p.quadraticCurveTo(0, -0.05, 0.2, -0.02); p.quadraticCurveTo(0.48, 0.05, 0.5, 0.6); p.closePath();
  if (hood) { p.moveTo(0, -0.62); p.quadraticCurveTo(0.24, -0.62, 0.25, -0.3); p.quadraticCurveTo(0.26, -0.05, 0.3, 0.05); p.lineTo(-0.3, 0.05); p.quadraticCurveTo(-0.26, -0.05, -0.25, -0.3); p.quadraticCurveTo(-0.24, -0.62, 0, -0.62); p.closePath(); }
  else { ellipseP(p, 0, -0.3, 0.19, 0.24); ellipseP(p, 0, -0.14, 0.14, 0.16); p.rect(-0.08, -0.12, 0.16, 0.16); }
  return p;
}

// ---------- oliveira (pré-renderizada) ----------
function drawOlive(ctx, x, y, s, seed, col = '#0b1424', leaf = '#0e1a2e') {
  const p = new Path2D();
  // tronco retorcido
  const tw = 0.09;
  let px = 0, py = 0;
  const pts = [];
  for (let i = 0; i <= 10; i++) {
    const v = i / 10;
    pts.push([noise1(v * 3, seed) * 0.12 + Math.sin(v * 4 + seed) * 0.03, -v * 0.55, tw * (1 - v * .55)]);
  }
  for (let i = 0; i < pts.length - 1; i++) capsule(p, pts[i][0], pts[i][1], pts[i][2], pts[i + 1][0], pts[i + 1][1], pts[i + 1][2]);
  const top = pts[pts.length - 1];
  const leaves = [];
  function branch(bx, by, ang, len, w, d) {
    const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
    capsule(p, bx, by, w, ex, ey, w * .6);
    if (d > 0) {
      const n = 2 + (rnd(d * 31 + bx * 100, seed) > .5 ? 1 : 0);
      for (let k = 0; k < n; k++) branch(ex, ey, ang + (rnd(k + d * 7, seed + 3) - .5) * 1.4, len * (.6 + rnd(k, seed + d) * .25), w * .62, d - 1);
    } else leaves.push([ex, ey]);
  }
  for (let k = 0; k < 4; k++) branch(top[0], top[1], -Math.PI / 2 + (k - 1.5) * .55 + (rnd(k, seed) - .5) * .3, 0.22 + rnd(k, seed + 9) * .08, 0.035, 3);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.fill(p);
  ctx.fillStyle = leaf;
  leaves.forEach(([lx, ly], i) => {
    for (let k = 0; k < 9; k++) {
      const a = rnd(i * 13 + k, seed + 5) * TAU, r = rnd(i * 17 + k, seed + 6) * 0.09;
      ctx.beginPath(); ctx.ellipse(lx + Math.cos(a) * r, ly + Math.sin(a) * r * .7, 0.05, 0.035, a, 0, TAU); ctx.fill();
    }
  });
  ctx.restore();
}

// ---------- martelo de juiz ----------
function gavelUnit() {
  const p = new Path2D();
  roundRectP(p, -0.5, -0.16, 1.0, 0.32, 0.08);   // cabeça
  p.rect(-0.62, -0.18, 0.1, 0.36); p.rect(0.52, -0.18, 0.1, 0.36);
  p.rect(-0.06, 0.15, 0.12, 1.25);               // cabo
  ellipseP(p, 0, 1.42, 0.09, 0.09);
  return p;
}
function roundRectP(p, x, y, w, h, r) {
  p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r);
  p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath();
}

// ---------- redoma de vidro ----------
function bellJar(ctx, cx, baseY, w, h, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  const p = new Path2D();
  p.moveTo(cx - w / 2, baseY);
  p.lineTo(cx - w / 2, baseY - h + w / 2);
  p.arc(cx, baseY - h + w / 2, w / 2, Math.PI, 0);
  p.lineTo(cx + w / 2, baseY);
  const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
  g.addColorStop(0, 'rgba(200,225,255,.20)'); g.addColorStop(.2, 'rgba(200,225,255,.05)');
  g.addColorStop(.8, 'rgba(200,225,255,.04)'); g.addColorStop(1, 'rgba(200,225,255,.16)');
  ctx.fillStyle = g; ctx.fill(p);
  ctx.strokeStyle = 'rgba(215,235,255,.55)'; ctx.lineWidth = 3; ctx.stroke(p);
  // reflexos
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx - w * .36, baseY - h * .2); ctx.lineTo(cx - w * .36, baseY - h + w * .55);
  ctx.arc(cx, baseY - h + w / 2, w * .36, Math.PI, Math.PI * 1.32); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.3)';
  ctx.beginPath(); ctx.moveTo(cx + w * .38, baseY - h * .25); ctx.lineTo(cx + w * .38, baseY - h * .55); ctx.stroke();
  // pegador
  ctx.fillStyle = 'rgba(215,235,255,.45)'; ctx.beginPath(); ctx.arc(cx, baseY - h - 14, 16, 0, TAU); ctx.fill();
  // base
  ctx.fillStyle = 'rgba(160,180,210,.25)'; ctx.fillRect(cx - w / 2 - 20, baseY - 4, w + 40, 14);
  ctx.restore();
}

// ---------- broto ----------
function sprout(ctx, x, y, grow, bend, t, color = '#7fbf6a') {
  const h = 260 * grow;
  const tipX = x + bend * 60 + Math.sin(t * 1.3) * 4, tipY = y - h + bend * 50;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - 10, y - h * .6, tipX, tipY); ctx.stroke();
  const leaf = (lx, ly, ang, s) => { ctx.save(); ctx.translate(lx, ly); ctx.rotate(ang); ctx.scale(s, s); ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(40, -36, 90, 0); ctx.quadraticCurveTo(40, 30, 0, 0); ctx.fill(); ctx.restore(); };
  const ls = clamp(grow * 1.4 - .3);
  if (ls > 0) { leaf(x - 4, y - h * .45, -2.5 + bend * .2, ls * .9); leaf(x - 4, y - h * .55, -.6 - bend * .2, ls); }
  const ts = clamp(grow * 1.6 - .6);
  if (ts > 0) { leaf(tipX, tipY, -1.9 + bend * .9, ts * .7); leaf(tipX, tipY, -1.1 + bend * .9, ts * .6); }
  ctx.restore();
}
