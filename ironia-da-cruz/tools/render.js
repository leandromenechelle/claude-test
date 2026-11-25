// Render determinístico quadro a quadro, em paralelo, direto para segmentos H.264.
// Uso: node tools/render.js <dir_saida> [workers=4] [fps=30] [t0] [t1]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');

(async () => {
  const out = path.resolve(process.argv[2]);
  const workers = parseInt(process.argv[3] || '4');
  const fps = parseInt(process.argv[4] || '30');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--disable-gpu', '--allow-file-access-from-files'] });
  const probe = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await probe.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await probe.evaluate(() => window.READY);
  const dur = await probe.evaluate(() => window.DURATION);
  await probe.close();
  const t0 = process.argv[5] ? parseFloat(process.argv[5]) : 0;
  const t1 = process.argv[6] ? parseFloat(process.argv[6]) : dur;
  const f0 = Math.round(t0 * fps), f1 = Math.ceil(t1 * fps);
  const total = f1 - f0, per = Math.ceil(total / workers);
  let done = 0; const start = Date.now();
  const job = async (w) => {
    const a = f0 + w * per, b = Math.min(f1, a + per);
    if (a >= b) return;
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('pageerror', e => console.log('[pageerror]', e.message));
    await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
    await page.evaluate(() => window.READY);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-tune', 'film', '-pix_fmt', 'yuv420p', '-r', String(fps),
      path.join(out, `seg${String(w).padStart(2, '0')}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = a; i < b; i++) {
      const b64 = await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .95); }, i / fps);
      const buf = Buffer.from(b64.slice(b64.indexOf(',') + 1), 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      done++;
      if (done % 300 === 0) { const el = (Date.now() - start) / 1000; console.log(`${done}/${total} frames  ${(done / el).toFixed(1)} fps  eta ${((total - done) / (done / el)).toFixed(0)}s`); }
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    await page.close();
  };
  await Promise.all([...Array(workers)].map((_, w) => job(w)));
  await browser.close();
  const list = [...Array(workers)].map((_, w) => path.join(out, `seg${String(w).padStart(2, '0')}.mp4`)).filter(f => fs.existsSync(f));
  fs.writeFileSync(path.join(out, 'list.txt'), list.map(f => `file '${f}'`).join('\n'));
  console.log('DONE', total, 'frames in', ((Date.now() - start) / 1000).toFixed(0), 's');
})();
