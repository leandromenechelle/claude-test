"""Sintetiza a narração frase a frase com Kokoro (voz pt-BR local),
monta a faixa com pausas controladas e extrai o tempo de cada palavra
com faster-whisper (alinhado ao texto do roteiro).

Uso: python3 tools/narrar.py <dir_modelos>
  <dir_modelos> deve conter kokoro/model.onnx, kokoro/voices.bin e whisper/medium
Saídas: narracao/narracao.wav, web/timing.json
"""
import json, os, re, sys, difflib, subprocess
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS = sys.argv[1]

import espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper
EspeakWrapper.set_library(espeakng_loader.get_library_path())
EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
from misaki import espeak
from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel

cfg = json.load(open(os.path.join(ROOT, "narracao", "roteiro.json")))
g2p = espeak.EspeakG2P(language="pt-br")
tts = Kokoro(os.path.join(MODELS, "kokoro", "model.onnx"), os.path.join(MODELS, "kokoro", "voices.bin"))
SR = 24000

def trim(x, thr=0.008, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(pad * SR))
    b = min(len(x), idx[-1] + int(pad * SR))
    return x[a:b]

def resample16k(x):
    p = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                        "-ar", "16000", "-f", "f32le", "-"], input=x.astype(np.float32).tobytes(),
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.float32).copy()

wm = WhisperModel(os.path.join(MODELS, "whisper", "medium"), device="cpu", compute_type="int8", cpu_threads=4)

def norm(w):
    w = w.lower()
    w = re.sub(r"[^\wáàâãéêíóôõúüç]", "", w)
    return w

pieces = []
t = cfg["lead_in"]
pieces.append(np.zeros(int(cfg["lead_in"] * SR), dtype=np.float32))
sentences, words = [], []
for s in cfg["sentences"]:
    ps = g2p(s["text"])
    audio, sr = tts.create(ps, voice=cfg["voice"], speed=cfg["speed"], is_phonemes=True)
    assert sr == SR
    audio = trim(audio.astype(np.float32))
    dur = len(audio) / SR
    start = t
    pieces.append(audio)
    t += dur
    sentences.append({"id": s["id"], "sec": s["sec"], "start": round(start, 3), "end": round(t, 3), "text": s["text"]})
    # alinhamento por palavra
    segs, _ = wm.transcribe(resample16k(audio), language="pt", beam_size=5, word_timestamps=True,
                            initial_prompt=s["text"])
    ww = [w for sg in segs for w in sg.words]
    hyp = [norm(w.word) for w in ww]
    ref_tokens = s["text"].split()
    ref = [norm(w) for w in ref_tokens]
    sm = difflib.SequenceMatcher(a=ref, b=hyp, autojunk=False)
    times = [None] * len(ref)
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            w = ww[blk.b + k]
            times[blk.a + k] = (w.start, w.end)
    # interpola palavras sem correspondência
    for i in range(len(times)):
        if times[i] is None:
            prev_end = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
            nxt = next(((j, times[j][0]) for j in range(i + 1, len(times)) if times[j]), (len(times), dur))
            gap_n = nxt[0] - i + 1
            step = (nxt[1] - prev_end) / max(1, gap_n)
            times[i] = (prev_end, prev_end + step)
    matched = sum(1 for blk in sm.get_matching_blocks() for _ in range(blk.size))
    print(f"{s['id']}: {dur:5.2f}s  match {matched}/{len(ref)}  | {' '.join(hyp)[:80]}", flush=True)
    for tok, (a, b) in zip(ref_tokens, times):
        words.append({"w": tok, "s": round(start + a, 3), "e": round(start + b, 3), "sid": s["id"]})
    gap = s["pause"]
    pieces.append(np.zeros(int(gap * SR), dtype=np.float32))
    t += gap

pieces.append(np.zeros(int(cfg["tail"] * SR), dtype=np.float32))
full = np.concatenate(pieces)
peak = np.max(np.abs(full))
full = full / peak * 0.89
os.makedirs(os.path.join(ROOT, "narracao"), exist_ok=True)
sf.write(os.path.join(ROOT, "narracao", "narracao.wav"), full, SR, subtype="PCM_16")
total = len(full) / SR
json.dump({"duration": round(total, 3), "sentences": sentences, "words": words},
          open(os.path.join(ROOT, "web", "timing.json"), "w"), ensure_ascii=False, indent=1)
print("TOTAL", round(total, 2), "s")
