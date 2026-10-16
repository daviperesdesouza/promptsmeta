// Gera a imagem de compartilhamento (WhatsApp, Facebook, Google): public/og-capa.jpg, 1200×630.
// Usa a foto real do topo e os textos de src/content/site.ts. Uso: npm run og
// Precisa do Chromium do Playwright (npx playwright install chromium) ou de CHROMIUM_PATH.
import { chromium } from 'playwright';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';

const b64 = async f => (await readFile(f)).toString('base64');
const archivo = await b64('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2');
const instrument = await b64('node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-wght-normal.woff2');
const foto = (await sharp('src/assets/fotos/hero-desktop.jpg').resize(560, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 88 }).toBuffer()).toString('base64');

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face { font-family: A; src: url(data:font/woff2;base64,${archivo}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
@font-face { font-family: I; src: url(data:font/woff2;base64,${instrument}) format('woff2'); font-weight: 400 700; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #f3f4f0; display: grid; grid-template-columns: 640px 560px; font-family: I, sans-serif; color: #101010; overflow: hidden; }
.txt { padding: 58px 40px 52px 64px; display: flex; flex-direction: column; }
.marca { display: flex; align-items: center; gap: 12px; font: 800 34px/1 A; font-stretch: 112%; letter-spacing: -.04em; }
.marca b { font: inherit; } .marca i { font-style: normal; color: #048437; }
.marca span { font: 700 11px/1.15 A; font-stretch: 125%; letter-spacing: .16em; text-transform: uppercase; color: #4a504b; border-left: 1.5px solid #d6d9d1; padding-left: 12px; }
h1 { margin-top: auto; font: 800 64px/.95 A; letter-spacing: -.035em; }
h1 em { font-style: normal; color: #048437; }
.rot { margin-top: 26px; display: flex; align-items: center; gap: 12px; font: 700 14px/1 A; font-stretch: 125%; letter-spacing: .16em; text-transform: uppercase; color: #4a504b; }
.rot::before { content: ""; width: 30px; height: 2.5px; background: #048437; }
.foto { position: relative; background: url(data:image/jpeg;base64,${foto}) center / cover; border-bottom-left-radius: 34px; }
.chip { position: absolute; left: 22px; bottom: 24px; display: flex; align-items: center; gap: 10px; background: #fff; border-radius: 999px; padding: 11px 18px; font: 600 16px/1 I; box-shadow: 0 16px 30px -18px rgba(0,0,0,.5); }
.chip b { width: 9px; height: 9px; border-radius: 50%; background: #048437; box-shadow: 0 0 0 4px #dcefe3; }
</style></head><body>
<div class="txt">
  <div class="marca"><b>FTS<i>.</i></b><span>Multimarcas<br>0km</span></div>
  <h1>Seu próximo carro, <em>sem rodar concessionária.</em></h1>
  <p class="rot">14 marcas · um consultor · Aracruz-ES</p>
</div>
<div class="foto"><span class="chip"><b></b>Fabricio Teixeira · consultor 0 km</span></div>
</body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile('public/og-capa.jpg');
console.log('✔ public/og-capa.jpg (1200×630)');
