// ===== Lista de eventos sonoros, derivada das mesmas constantes das cenas =====
window.SFX_CUES = function () {
  const q = [];
  const add = (type, t, o = {}) => q.push(Object.assign({ type, t: +t.toFixed(3) }, o));
  // transições entre cenas
  SCENES.forEach((s, i) => { if (i > 0) add('whoosh', s.a + .05, { g: .5 }); });
  // gancho
  HOOK_GROUPS.forEach((g, i) => { if (i > 0) add('swish', g.s, { g: .35 }); });
  add('hit', ws('s1', 'traicao'), { g: .7, pitch: .8 });
  add('shimmer', ws('s1', 'salvacao'), { g: .45 });
  add('hit', ws('s1', 'protecao'), { g: .7, pitch: 1.1 });
  add('glitch', ws('s1', 'estragou'), { g: .5 });
  add('riser', JUDAS_CUT - 1.0, { d: 1.0, g: .45 });
  add('boom', JUDAS_CUT, { g: 1 });
  DROPS.forEach((d, i) => add('coin', d.t0 + .05 + i * .01, { g: .45, n: 2 }));
  add('riser', SEN.s4.end - .9, { d: 1.35, g: .4 });
  add('boom', SEN.s4.end + .45, { g: .8 });
  // trilho
  add('train', TR_A, { d: TR_B - TR_A, g: .5 });
  STATIONS.forEach(st => add('bell', st.a() + .1, { g: .4 }));
  add('ghost', ws('s9', 'segunda') - .3, { g: .45, d: 3 });
  add('stamp', ws('s11', 'vilao') - .05, { g: 1 });
  add('hit', ws('s11', 'injusto'), { g: .4, pitch: 1.4 });
  add('riser', TR_B - 1.6, { d: 1.6, g: .5 });
  add('boom', (PL_A + TR_B) / 2, { g: .8 });
  // plano
  FCOINS.forEach((c, i) => add('coin', ws('s12', 'moedas') - .15 + c.d + .75, { g: .28 + rnd(i, 3) * .12, n: 1 }));
  add('fall', ws('s13', 'remorso'), { d: 2.4, g: .45 });
  [0, 1, 2].forEach(i => add('chime', ws('s14', 'tres') + i * .25, { g: .4, note: [0, 4, 7][i] }));
  // ceia, bocado, noite
  add('fire', CE_A, { d: CE_B - CE_A + .6, g: .55 });
  add('hit', ws('s15', 'entregaria'), { g: .35, pitch: .6 });
  add('fire', BO_A, { d: BO_CUT - BO_A, g: .4 });
  add('wind', BO_CUT, { d: BO_B - BO_CUT, g: .35 });
  add('door', SEN.s17.start + .1, { g: .7 });
  // Getsêmani
  add('night', JA_A, { d: JA_B - JA_A, g: .5 });
  add('shimmer', ws('s17', 'calice'), { g: .3 });
  add('fire', JA_KISS, { d: JA_B - JA_KISS, g: .45 });
  add('hit', ws('s18', 'beijo'), { g: .5, pitch: .7 });
  // tribunal
  add('swing', ws('s19', 'tribunal') - .6, { g: .6 });
  STAMPS.forEach((s, i) => add('stamp', ws('s19', 'ordem') + i * .32, { g: .55 }));
  add('dissolve', SEN.s19.end + .1, { d: 1.6, g: .5 });
  // inversão
  add('boom', SEN.s20.start - .1, { g: .7 });
  add('pop', ws('s22', 'intencao'), { g: .4 });
  add('pop', ws('s23', 'efeito'), { g: .4 });
  add('lock', ws('s23', 'impediria') - .05, { g: .8 });
  add('stone', ws('s25', 'pedra') + .05, { g: .8 });
  add('gear', SEN.s26.start - .4, { d: SEN.s28.end - SEN.s26.start + .8, g: .55 });
  add('pop', ws('s26', 'traindo'), { g: .4 });
  add('pop', ws('s26', 'acelera'), { g: .4 });
  add('swish', SEN.s27.start + .4, { g: .5 });
  add('swish', SEN.s28.start + .4, { g: .5 });
  // pais e filhos
  add('glass', ws('s30', 'medo') + .4, { g: .55 });
  add('creak', ws('s32', 'empurra') - .3, { g: .5 });
  add('wind', ws('s32', 'empurra'), { d: SEN.s34.end - ws('s32', 'empurra') + .5, g: .5 });
  // fechamento
  add('gear', SEN.s35.start + 1, { d: TM.duration - SEN.s35.start - 2, g: .25 });
  add('stamp', ws('s36', 'imperdoavel') - .15, { g: .7 });
  add('swish', ws('s36', 'humanidade') - .6, { g: .4 });
  ['humanidade', 'ironia', 'peso'].forEach((w, i) => add('chime', ws('s36', w), { g: .35, note: [0, 3, 7][i] }));
  add('boom', SEN.s37.start - .1, { g: .75 });
  add('hit', ws('s38', 'intencao'), { g: .45, pitch: 1.2 });
  add('hit', ws('s38', 'efeito'), { g: .45, pitch: .9 });
  return q.sort((a, b) => a.t - b.t);
};
// seções para a trilha
window.MUSIC_SECTIONS = function () {
  return {
    hook: [0, JUDAS_CUT, SEN.s4.end + .45, TR_A], trilho: [TR_A, TR_B], plano: [PL_A, PL_B], ceia: [CE_A, CE_B], bocado: [BO_A, BO_CUT, BO_B],
    jardim: [JA_A, JA_CLOSE, JA_KISS, JA_B], tribunal: [TB_A, TB_B], inversao: [IV_A, SEN.s26.start, SEN.s27.start, IV_B], pais: [PA_A, SEN.s32.start, PA_B],
    final: [FI_A, SEN.s37.start, SEN.s38.start, TM.duration], duration: TM.duration,
    speech: TM.sentences.map(s => [s.start, s.end]),
  };
};
