// Renderiza quadros avulsos para conferência: node tools/still.js out.jpg t1 t2 ...
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { execFileSync } = require('child_process');
(async () => {
  const [out, ...ts] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--disable-gpu', '--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => window.READY);
  const tmp = fs.mkdtempSync('/tmp/claude-0/still-');
  const files = [];
  for (let i = 0; i < ts.length; i++) {
    const t0 = Date.now();
    const data = await page.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .9); }, parseFloat(ts[i]));
    const f = `${tmp}/f${i}.jpg`; fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64')); files.push(f);
    console.log('t=', ts[i], (Date.now() - t0) + 'ms');
  }
  await browser.close();
  // folha de contato 360x640 por quadro
  const args = []; files.forEach(f => args.push('-i', f));
  const n = files.length;
  const filt = files.map((_, i) => `[${i}:v]scale=360:640[v${i}]`).join(';') + ';' + files.map((_, i) => `[v${i}]`).join('') + `hstack=inputs=${n}`;
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...args, '-filter_complex', n > 1 ? filt : '[0:v]scale=360:640', out]);
  console.log('ok', out);
})();
