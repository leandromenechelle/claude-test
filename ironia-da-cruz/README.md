# A Ironia da Cruz (vídeo 9:16, 100% animado e gerado localmente)

Vídeo vertical 1080x1920, 30 fps, cerca de 3min29s, com narração em português do Brasil.
Tudo foi produzido dentro do container, sem serviços externos de geração:

| Etapa | Ferramenta |
|---|---|
| Narração | Kokoro-82M (ONNX, voz `pm_alex`, licença Apache 2.0) com fonemas pt-BR via espeak-ng/misaki |
| Sincronia palavra a palavra | faster-whisper (modelo medium) alinhado ao texto do roteiro |
| Animação | HTML5 Canvas, função determinística `renderFrame(t)` |
| Render | Playwright/Chromium quadro a quadro, 4 processos em paralelo, ffmpeg/x264 |
| Trilha e efeitos | Síntese procedural em numpy/scipy (pads, pulso, moedas, engrenagem, vento etc.) |
| Mix | Ducking da trilha sob a voz, normalização em -15 LUFS |

## Estrutura

- `narracao/roteiro.json`: texto da narração por frase e pausas
- `narracao/narracao.wav`: voz sintetizada
- `web/`: animação (`engine.js`, `figures.js`, `scenes1-3.js`, `main.js`, `cues.js`) e `timing.json`
- `tools/narrar.py`: gera a voz e o tempo de cada palavra
- `tools/cues.js`: exporta os eventos sonoros a partir das cenas
- `tools/trilha.py`: sintetiza trilha e efeitos e faz a mixagem
- `tools/render.js`: renderiza os quadros em paralelo
- `tools/still.js`: gera folhas de contato para conferência

## Como regenerar

```bash
python3 tools/narrar.py <dir_modelos>      # kokoro/ e whisper/medium dentro do diretório
node tools/cues.js
python3 tools/trilha.py
node tools/render.js <saida> 4 30
```
