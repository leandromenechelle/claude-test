"""Trilha sonora e efeitos 100% sintetizados (numpy/scipy) + mixagem com a narração.

Uso: python3 tools/trilha.py
Entradas: audio/cues.json, narracao/narracao.wav
Saída: audio/mix.wav (48 kHz estéreo, antes da normalização de loudness)
"""
import json, os, math
import numpy as np
import soundfile as sf
from scipy import signal

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
data = json.load(open(os.path.join(ROOT, "audio", "cues.json")))
SEC = data["sections"]
DUR = SEC["duration"]
N = int((DUR + 1.0) * SR)
rng = np.random.default_rng(7)

def T(n): return np.arange(n) / SR
def S(sec): return int(round(sec * SR))
def lp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, 'low', fs=SR, output='sos'), x, axis=0)
def hp(x, fc, order=2): return signal.sosfilt(signal.butter(order, fc, 'high', fs=SR, output='sos'), x, axis=0)
def bp(x, f1, f2, order=2): return signal.sosfilt(signal.butter(order, [f1, f2], 'band', fs=SR, output='sos'), x, axis=0)
def noise(n): return rng.standard_normal(n)
def expdec(n, tau): return np.exp(-T(n) / tau)
def fade(x, a=0.005, b=0.02):
    n = len(x); x = x.copy()
    na, nb = min(n, S(a)), min(n, S(b))
    if na: x[:na] *= np.linspace(0, 1, na)
    if nb: x[-nb:] *= np.linspace(1, 0, nb)
    return x
def pan(x, p):  # p em [-1,1]
    l = math.cos((p + 1) * math.pi / 4); r = math.sin((p + 1) * math.pi / 4)
    return np.stack([x * l, x * r], axis=1)
def put(buf, x, t0, g=1.0):
    i = S(t0)
    if x.ndim == 1: x = pan(x, 0)
    if i < 0: x = x[-i:]; i = 0
    j = min(len(buf), i + len(x))
    if j > i: buf[i:j] += x[:j - i] * g

NOTE = {}
names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B']
for o in range(0, 8):
    for k, nm in enumerate(names):
        NOTE[f"{nm}{o}"] = 440 * 2 ** ((k - 9) / 12 + (o - 4))

# ---------------- MÚSICA ----------------
music = np.zeros((N, 2)); pulse = np.zeros((N, 2)); shim = np.zeros((N, 2))

def pad_note(f, n, bright=4.0):
    t = T(n); x = np.zeros(n)
    for dc in (-6, 0, 6):
        ff = f * 2 ** (dc / 1200); ph = rng.random() * 6.28
        for h in range(1, 11):
            if ff * h > 6000: break
            x += np.sin(2 * np.pi * ff * h * t + ph * h) * (1 / h) * math.exp(-h / bright)
    return x

def chord(t0, t1, notes, g=1.0, att=1.4, rel=1.8, bright=4.0, sub=True):
    n = S(t1 - t0 + rel)
    if n <= 0: return
    x = np.zeros(n)
    for nm in notes: x += pad_note(NOTE[nm], n, bright)
    if sub:
        root = NOTE[notes[0]] / 2; tt = T(n)
        x += 1.6 * np.sin(2 * np.pi * root * tt) + .5 * np.sin(2 * np.pi * root * 1.002 * tt)
    env = np.ones(n); na = min(n, S(att)); env[:na] = np.sin(np.linspace(0, np.pi / 2, na)) ** 2
    nr = min(n, S(rel)); env[-nr:] *= np.cos(np.linspace(0, np.pi / 2, nr)) ** 2
    lfo = 1 + .12 * np.sin(2 * np.pi * .13 * T(n) + rng.random() * 6)
    x = x * env * lfo * g * .022
    st = np.stack([x * (1 + .15 * np.sin(2 * np.pi * .07 * T(n))), x * (1 - .15 * np.sin(2 * np.pi * .07 * T(n)))], axis=1)
    put(music, st, t0)

def prog(a, b, chords, g=1.0, bright=4.0):
    step = (b - a) / len(chords)
    for i, c in enumerate(chords): chord(a + i * step, a + (i + 1) * step, c, g, bright=bright)

def shimmer_pad(a, b, notes, g=1.0):
    n = S(b - a + 2); t = T(n); x = np.zeros(n)
    for nm in notes:
        f = NOTE[nm]
        x += np.sin(2 * np.pi * f * t) * (0.6 + 0.4 * np.sin(2 * np.pi * (0.2 + rng.random() * .3) * t))
    env = np.minimum(1, t / 2.0) * np.minimum(1, np.maximum(0, (b - a + 2 - t)) / 2.0)
    put(shim, pan(x * env * g * .012, 0), a)

def thump(t0, g=1.0):
    n = S(.5); t = T(n)
    f = 58 * np.exp(-t * 6) + 34
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * expdec(n, .12)
    x += lp(noise(n), 300) * expdec(n, .02) * .3
    put(pulse, fade(x) * g * .5, t0)

def heartbeat(a, b, bpm0, bpm1, g=1.0):
    t = a
    while t < b:
        p = (t - a) / max(1e-6, b - a); bpm = bpm0 + (bpm1 - bpm0) * p
        thump(t, g); thump(t + .28, g * .6)
        t += 60 / bpm

def tick(t0, g=1.0, f=4000):
    n = S(.05); x = bp(noise(n), f * .7, min(f * 1.4, 20000)) * expdec(n, .008)
    put(pulse, pan(fade(x, .0005, .005) * g * .35, .3), t0)

H = SEC["hook"]; TRk = SEC["trilho"]; PL = SEC["plano"]; CE = SEC["ceia"]; BO = SEC["bocado"]
JA = SEC["jardim"]; TB = SEC["tribunal"]; IV = SEC["inversao"]; PA = SEC["pais"]; FI = SEC["final"]
sp = {s: e for s, e in SEC["speech"]}

# gancho
chord(0.0, H[1], ['D3', 'A3', 'F4'], .8)
chord(H[1], (H[1] + H[2]) / 2, ['Bb2', 'F3', 'D4'], 1.0)
chord((H[1] + H[2]) / 2, H[2], ['G2', 'D3', 'Bb3'], 1.0)
chord(H[2], H[3] + .5, ['A2', 'E3', 'C#4'], 1.1)
heartbeat(0.7, H[1] - .2, 60, 66, .8)
heartbeat(H[1] + .4, H[2], 58, 58, .6)
# trilho: inevitável
prog(TRk[0], TRk[1], [['D3', 'A3', 'F4'], ['Bb2', 'F3', 'D4'], ['G2', 'D3', 'Bb3'], ['A2', 'E3', 'C#4']] * 2, 1.0)
heartbeat(TRk[0] + .3, TRk[1] - .5, 64, 84, .9)
tt = TRk[0] + .3
while tt < TRk[1] - .6:
    tick(tt, .8); p = (tt - TRk[0]) / (TRk[1] - TRk[0]); tt += 60 / (128 + 40 * p) / 2
# plano
prog(PL[0], PL[1], [['D3', 'A3', 'E4', 'F4'], ['F2', 'C3', 'A3'], ['C3', 'G3', 'E4'], ['D3', 'A3', 'F4']], .8, bright=3)
# ceia
prog(CE[0], CE[1], [['D3', 'F3', 'A3', 'D4'], ['D3', 'G3', 'Bb3']], .85, bright=3)
# bocado e noite
chord(BO[0], BO[1], ['Bb2', 'F3', 'D4'], .8, bright=3)
chord(BO[1], BO[2], ['A2', 'E3', 'C#4'], .9, bright=3)
# Getsêmani
prog(JA[0], JA[2], [['D3', 'A3', 'F4'], ['Bb2', 'D3', 'F3', 'A3'], ['G2', 'D3', 'Bb3']], .9)
chord(JA[2], JA[3], ['A2', 'E3', 'G3', 'C#4'], 1.0)
shimmer_pad(JA[0], JA[2], ['D5', 'A5', 'F5'], .9)
# tribunal
chord(TB[0], (TB[0] + TB[1]) / 2, ['D3', 'E3', 'F3', 'A3'], 1.0)
chord((TB[0] + TB[1]) / 2, TB[1], ['A2', 'E3', 'C#4'], .9)
# inversão
prog(IV[0], IV[3], [['D3', 'A3', 'F4'], ['C3', 'G3', 'E4'], ['Bb2', 'F3', 'D4'], ['A2', 'E3', 'C#4']] * 2, 1.0)
heartbeat(IV[0] + .5, IV[3] - .5, 70, 76, .6)
# pais e filhos: mais aberto
prog(PA[0], PA[2], [['F2', 'C3', 'A3'], ['C3', 'G3', 'E4'], ['D3', 'A3', 'F4'], ['Bb2', 'F3', 'D4']] * 2, .8, bright=3.5)
shimmer_pad(PA[1], PA[2], ['F5', 'C6', 'A5'], .8)
# fechamento
prog(FI[0], FI[1] - .2, [['Bb2', 'F3', 'D4'], ['F2', 'C3', 'A3'], ['C3', 'G3', 'E4'], ['D3', 'A3', 'F4']], 1.0)
chord(FI[2] - .2, FI[2] + 2.6, ['Bb2', 'F3', 'D4'], 1.0)
chord(FI[2] + 2.6, FI[3] + 1, ['D3', 'F#3', 'A3', 'D4'], 1.15, att=2.0, rel=2.5)
shimmer_pad(FI[0] + 2, FI[3], ['D5', 'A5', 'F#5'], 1.0)

# reverb de sala grande
def make_ir(sec=3.2, seed=1):
    r = np.random.default_rng(seed); n = S(sec)
    ir = r.standard_normal(n) * np.exp(-T(n) / (sec / 6.5))
    ir = lp(ir, 5000); ir[:S(.012)] = 0; return ir / np.sqrt(np.sum(ir ** 2))
IRL, IRR = make_ir(seed=1), make_ir(seed=2)
def reverb(x, wet=.35):
    l = signal.fftconvolve(x[:, 0], IRL)[:len(x)]; r = signal.fftconvolve(x[:, 1], IRR)[:len(x)]
    return x * (1 - wet) + np.stack([l, r], axis=1) * wet * 1.4

music = reverb(lp(music, 4200), .45)
shim = reverb(shim, .7)
pulse = reverb(pulse, .2)

# ---------------- EFEITOS ----------------
sfx = np.zeros((N, 2))
def whoosh(d=.9, f0=300, f1=2400, g=1.0):
    n = S(d); t = T(n); x = noise(n)
    out = np.zeros(n); seg = S(.02)
    fc = f0 * (f1 / f0) ** np.sin(np.pi * t / d)
    for i in range(0, n, seg):
        f = fc[i]; out[i:i + seg] = bp(x[i:i + seg + 400], f * .6, min(f * 1.6, 20000))[:len(out[i:i + seg])]
    env = np.sin(np.pi * t / d) ** 2
    y = out * env; return np.stack([y * np.linspace(1.2, .5, n), y * np.linspace(.5, 1.2, n)], axis=1) * g * .5
def hit(pitch=1.0, g=1.0):
    n = S(1.0); t = T(n)
    f = 95 * pitch * np.exp(-t * 7) + 55 * pitch
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * expdec(n, .22)
    x += bp(noise(n), 200, 3000) * expdec(n, .03) * .4
    return fade(x) * g * .8
def boom(g=1.0):
    n = S(3.0); t = T(n)
    f = 52 * np.exp(-t * 2.5) + 28
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * expdec(n, .7)
    x += lp(noise(n), 160) * expdec(n, .5) * 1.2 + bp(noise(n), 300, 2500) * expdec(n, .05) * .5
    return fade(x) * g * .9
def riser(d=1.0, g=1.0):
    n = S(d); t = T(n)
    x = hp(noise(n), 800) * (t / d) ** 2 * .5
    f = 200 + 900 * (t / d) ** 2
    x += np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 3 * .25
    return fade(x, .1, .01) * g
def shimmer(g=1.0):
    n = S(2.5); t = T(n); x = np.zeros(n)
    for f in (1174.66, 1760, 2349.3, 2637):
        x += np.sin(2 * np.pi * f * t + rng.random() * 6) * (0.7 + .3 * np.sin(2 * np.pi * 7 * t))
    return fade(x * expdec(n, .7) * (1 - np.exp(-t * 30)), .01, .2) * g * .12
def glitch(g=1.0):
    n = S(.6); x = noise(n)
    gate = np.repeat(rng.random(n // 480 + 1) > .45, 480)[:n]
    x = np.round(x * 4) / 4 * gate * expdec(n, .25)
    return fade(bp(x, 400, 6000)) * g * .5
def coin(g=1.0, n_b=1):
    n = S(.6); t = T(n); x = np.zeros(n)
    base = 2000 + rng.random() * 900
    for k, r in enumerate((1.0, 1.58, 2.31, 3.07, 3.89)):
        x += np.sin(2 * np.pi * base * r * t + rng.random() * 6) * expdec(n, .09 / (1 + k * .4)) / (1 + k * .5)
    x += hp(noise(n), 4000) * expdec(n, .004) * .5
    out = fade(x, .0005, .05)
    for b in range(1, n_b):
        out = out + np.concatenate([np.zeros(S(.09 * b)), out[:n - S(.09 * b)] * .4 ** b])
    return out * g * .35
def bell(g=1.0, f=880):
    n = S(2.0); t = T(n); x = np.zeros(n)
    for r, a in ((1, 1), (2.76, .4), (5.4, .2), (.5, .3)):
        x += np.sin(2 * np.pi * f * r * t) * a * expdec(n, .7 / r ** .5)
    return fade(x, .001, .2) * g * .18
def ghost(d=3, g=1.0):
    n = S(d); t = T(n); x = np.zeros(n)
    for f in (880, 1318.5, 1760 * 1.003):
        x += np.sin(2 * np.pi * f * t + 3 * np.sin(2 * np.pi * 5.5 * t))
    env = np.sin(np.pi * t / d) ** 2
    return x * env * g * .06
def stamp(g=1.0):
    n = S(.8); t = T(n)
    x = np.sin(2 * np.pi * (70 * np.exp(-t * 10) + 45) * t) * expdec(n, .12)
    x += bp(noise(n), 150, 2500) * expdec(n, .045) * .9
    return fade(x) * g * .9
def fall(d=2.4, g=1.0):
    n = S(d); t = T(n)
    f = 700 * (120 / 700) ** (t / d) * (1 + .01 * np.sin(2 * np.pi * 6 * t))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - t / d) ** 1.5
    return fade(x, .05, .1) * g * .2
def chime(g=1.0, note=0):
    return bell(g, 587.33 * 2 ** (note / 12)) * 1.2
def fire(d, g=1.0):
    n = S(d); t = T(n)
    x = lp(noise(n), 400) * .25 * (1 + .3 * np.sin(2 * np.pi * .7 * t))
    k = int(d * 9)
    for _ in range(k):
        i = rng.integers(0, max(1, n - 2000)); m = S(.004 + rng.random() * .01)
        x[i:i + m] += hp(noise(m), 1500) * expdec(m, .002) * (0.5 + rng.random())
    env = np.minimum(1, t / .8) * np.minimum(1, (d - t) / .8)
    return x * env * g * .45
def wind(d, g=1.0):
    n = S(d); t = T(n); x = noise(n)
    out = np.zeros(n); seg = S(.05)
    fc = 500 + 300 * np.sin(2 * np.pi * .23 * t) + 150 * np.sin(2 * np.pi * .61 * t)
    for i in range(0, n, seg): out[i:i + seg] = bp(x[i:i + seg + 800], fc[i] * .7, fc[i] * 1.5)[:len(out[i:i + seg])]
    env = np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.2) * (0.7 + .3 * np.sin(2 * np.pi * .3 * t))
    return np.stack([out * env, np.roll(out, 900) * env], axis=1) * g * .5
def door(g=1.0):
    n = S(1.2); t = T(n)
    x = np.sin(2 * np.pi * (80 * np.exp(-t * 8) + 50) * t) * expdec(n, .15) + bp(noise(n), 100, 1200) * expdec(n, .06) * .8
    m = S(.03); x[S(.12):S(.12) + m] += hp(noise(m), 2500) * expdec(m, .005) * .6
    return fade(x) * g * .8
def night(d, g=1.0):
    n = S(d); t = T(n); x = lp(noise(n), 500) * .08
    tt = .3
    while tt < d - .5:
        for p in range(3):
            i = S(tt + p * .035); m = S(.02)
            if i + m < n: x[i:i + m] += np.sin(2 * np.pi * 4600 * T(m)) * np.hanning(m) * .12
        tt += .5 + rng.random() * 1.1
    env = np.minimum(1, t / 1.5) * np.minimum(1, (d - t) / 1.5)
    return np.stack([x * env, np.roll(x, 3000) * env], axis=1) * g
def swing(g=1.0): return whoosh(.6, 150, 900, g)
def dissolve(d=1.6, g=1.0):
    n = S(d); x = np.zeros(n)
    for _ in range(140):
        i = rng.integers(0, n - 3000); m = S(.03); f = 3000 + rng.random() * 5000
        x[i:i + m] += np.sin(2 * np.pi * f * T(m)) * np.hanning(m) * (1 - i / n)
    x += hp(noise(n), 3000) * np.linspace(.3, 0, n) * .3
    return x * g * .12
def pop(g=1.0):
    n = S(.12); t = T(n); f = 700 * np.exp(-t * 18) + 250
    return fade(np.sin(2 * np.pi * np.cumsum(f) / SR) * expdec(n, .04)) * g * .5
def lock(g=1.0):
    n = S(.9); t = T(n); x = np.zeros(n)
    for f, a, tau in ((310, 1, .25), (820, .6, .15), (1430, .4, .1), (2650, .25, .06)):
        x += np.sin(2 * np.pi * f * t) * a * expdec(n, tau)
    x += bp(noise(n), 1000, 8000) * expdec(n, .006) * 1.2
    m = S(.15); x[m:m * 2] += hp(noise(m), 3000)[:m] * expdec(m, .004) * .6
    return fade(x) * g * .55
def stone(g=1.0):
    n = S(1.4); t = T(n)
    x = np.sin(2 * np.pi * (60 * np.exp(-t * 6) + 35) * t) * expdec(n, .2) * 1.2
    gr = bp(noise(n), 400, 4000)
    for _ in range(40):
        i = rng.integers(S(.05), S(.9)); m = S(.006)
        gr[i:i + m] *= 6
    x += gr * expdec(n, .25) * .25
    return fade(x) * g * .8
def gear(d, g=1.0):
    n = S(d); x = np.zeros(n); t = T(n)
    x += (np.sin(2 * np.pi * 55 * t) * .3 + lp(noise(n), 200) * .3) * np.minimum(1, t / 1) * np.minimum(1, (d - t) / 1)
    tt = .1
    while tt < d - .1:
        p = tt / d; i = S(tt); m = S(.03)
        x[i:i + m] += bp(noise(m), 1500, 5000) * expdec(m, .006) * .9
        x[i + S(.012):i + S(.012) + m] += bp(noise(m), 800, 2500)[:len(x[i + S(.012):i + S(.012) + m])] * expdec(m, .008)[:len(x[i + S(.012):i + S(.012) + m])] * .5
        tt += 0.32 - 0.2 * p
    return x * g * .45
def glass(g=1.0):
    n = S(2.2); t = T(n); x = np.zeros(n)
    for f, a in ((2210, 1), (3890, .6), (5120, .4), (6930, .25)):
        x += np.sin(2 * np.pi * f * t + rng.random() * 6) * a * expdec(n, .5 + rng.random() * .3)
    x += hp(noise(n), 5000) * expdec(n, .003) * .4
    return fade(x, .0005, .3) * g * .12
def creak(g=1.0):
    n = S(1.3); t = T(n)
    f = 170 + 70 * np.sin(2 * np.pi * .8 * t) + 15 * rng.standard_normal(n).cumsum() / 2000
    saw = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR)
    x = bp(saw, 300, 2200) * np.sin(np.pi * t / 1.3) ** 2
    return fade(x) * g * .25
def train(d, g=1.0):
    n = S(d); x = np.zeros(n); t = T(n)
    x += lp(noise(n), 120) * .4 * np.minimum(1, t / 2) * np.minimum(1, (d - t) / 1)
    tt = .5
    while tt < d - .3:
        for off in (0, .14):
            i = S(tt + off); m = S(.05)
            if i + m < n: x[i:i + m] += bp(noise(m), 300, 1800) * expdec(m, .01) * .8
        tt += 1.05 - .45 * (tt / d)
    return x * g * .5

FX = dict(whoosh=lambda c: whoosh(g=c['g']), swish=lambda c: whoosh(.35, 800, 5000, c['g']), hit=lambda c: hit(c.get('pitch', 1), c['g']),
          boom=lambda c: boom(c['g']), riser=lambda c: riser(c['d'], c['g']), shimmer=lambda c: shimmer(c['g']), glitch=lambda c: glitch(c['g']),
          coin=lambda c: coin(c['g'], c.get('n', 1)), bell=lambda c: bell(c['g']), ghost=lambda c: ghost(c['d'], c['g']), stamp=lambda c: stamp(c['g']),
          fall=lambda c: fall(c['d'], c['g']), chime=lambda c: chime(c['g'], c.get('note', 0)), fire=lambda c: fire(c['d'], c['g']),
          wind=lambda c: wind(c['d'], c['g']), door=lambda c: door(c['g']), night=lambda c: night(c['d'], c['g']), swing=lambda c: swing(c['g']),
          dissolve=lambda c: dissolve(c['d'], c['g']), pop=lambda c: pop(c['g']), lock=lambda c: lock(c['g']), stone=lambda c: stone(c['g']),
          gear=lambda c: gear(c['d'], c['g']), glass=lambda c: glass(c['g']), creak=lambda c: creak(c['g']), train=lambda c: train(c['d'], c['g']))
for c in data["cues"]:
    x = FX[c['type']](c)
    if x.ndim == 1: x = pan(x, (rng.random() - .5) * .4)
    put(sfx, x, c['t'])
sfx = reverb(sfx, .22)

# ---------------- NARRAÇÃO ----------------
nar, nsr = sf.read(os.path.join(ROOT, "narracao", "narracao.wav"))
nar = signal.resample_poly(nar, SR, nsr)
nar = hp(nar, 70)
# leve presença
nar = nar + .25 * bp(nar, 2500, 6000)
voice = np.zeros((N, 2)); put(voice, pan(nar, 0), 0)

# ducking da música durante a fala
act = np.zeros(N)
for a, b in SEC["speech"]: act[S(a - .1):S(b + .15)] = 1
k = np.ones(S(.35)) / S(.35)
act = np.convolve(act, k, mode='same')
duck = 1 - .5 * act

def rms(x): return np.sqrt(np.mean(x ** 2) + 1e-12)
vr = rms(voice[voice[:, 0] != 0]) if np.any(voice) else 1
mus = music + shim * 1.0
mus = mus / rms(mus) * vr * .42
pul = pulse / (rms(pulse) + 1e-9) * vr * .18
sfx = sfx / np.max(np.abs(sfx)) * .55
mix = voice * 1.0 + (mus + pul) * duck[:, None] + sfx * (1 - .25 * act[:, None])
# fim: fade
fo = S(2.0); mix[-fo - S(1.0):-S(1.0)] *= np.linspace(1, 0, fo)[:, None]; mix[-S(1.0):] = 0
mix = mix[:S(DUR)]
mix = mix / np.max(np.abs(mix)) * .95
sf.write(os.path.join(ROOT, "audio", "mix.wav"), mix.astype(np.float32), SR, subtype='FLOAT')
sf.write(os.path.join(ROOT, "audio", "musica.wav"), (mus[:S(DUR)] / np.max(np.abs(mus)) * .9).astype(np.float32), SR, subtype='FLOAT')
print("ok", mix.shape, "dur", len(mix) / SR)
