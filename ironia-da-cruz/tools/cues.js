// Exporta a lista de eventos sonoros e seções musicais: node tools/cues.js
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const browser = await chromium.launch({ args: ['--disable-gpu'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  await page.goto('file://' + path.resolve(__dirname, '../web/index.html'));
  await page.evaluate(() => window.READY);
  const data = await page.evaluate(() => ({ cues: SFX_CUES(), sections: MUSIC_SECTIONS() }));
  fs.writeFileSync(path.resolve(__dirname, '../audio/cues.json'), JSON.stringify(data, null, 1));
  console.log(data.cues.length, 'cues');
  await browser.close();
})();
