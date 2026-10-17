// Testes do site publicado (pasta dist/). Uso: npm run build && npm run qa
// Precisa do Chromium do Playwright (npx playwright install chromium) ou de CHROMIUM_PATH.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve('dist');
if (!fs.existsSync(path.join(RAIZ, 'index.html'))) { console.error('Rode "npm run build" antes.'); process.exit(1); }

// Servidor local simples (com Range, para os vídeos).
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json' };
const srv = http.createServer((req, res) => {
  let u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(RAIZ, u);
  if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  const tam = fs.statSync(f).size, tipo = TIPOS[path.extname(f)] || 'application/octet-stream';
  const r = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (r) {
    const ini = r[1] ? +r[1] : 0, fim = r[2] ? +r[2] : tam - 1;
    res.writeHead(206, { 'Content-Type': tipo, 'Content-Range': `bytes ${ini}-${fim}/${tam}`, 'Accept-Ranges': 'bytes', 'Content-Length': fim - ini + 1 });
    fs.createReadStream(f, { start: ini, end: fim }).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': tam, 'Accept-Ranges': 'bytes' });
    fs.createReadStream(f).pipe(res);
  }
});
await new Promise(r => srv.listen(0, r));
const URL_SITE = `http://localhost:${srv.address().port}/`;

const NUMERO = '5527998490805';
const OI = 'Olá, Fabricio! Vim pelo site e ';
const ESPERADO = {
  encontrar: OI + 'quero encontrar meu próximo carro.',
  condicoes: OI + 'quero saber as condições para um carro 0 km.',
  usado: OI + 'quero avaliar meu usado na troca por um carro 0 km. Meu carro atual é: ',
  frota: OI + 'quero falar sobre a frota da minha empresa.',
};

let falhas = 0, total = 0;
const ok = (nome, cond, detalhe = '') => {
  total++;
  if (!cond) falhas++;
  console.log(`${cond ? '✔' : '✘'} ${nome}${detalhe ? ` (${detalhe})` : ''}`);
};
const texto = href => decodeURIComponent(new URL(href).searchParams.get('text') || '');

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--ignore-certificate-errors'] });
async function abre(w, h, opcoes = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, ...opcoes });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', e => erros.push(e.message));
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  await p.goto(URL_SITE, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  return { ctx, p, erros };
}
/** Rola a página inteira devagar, para disparar revelações e ilhas. */
const percorre = p => p.evaluate(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); }
});
/** Impede que os links de WhatsApp abram abas durante o teste (os handlers do site continuam rodando). */
const semNovasAbas = p => p.evaluate(() => document.addEventListener('click', e => {
  if (e.target?.closest?.('a[target="_blank"]')) e.preventDefault();
}, true));

// 1. Larguras: sem erro, um h1, sem rolagem lateral
for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1280, 800], [1440, 900]]) {
  const { ctx, p, erros } = await abre(w, h);
  await percorre(p);
  const r = await p.evaluate(() => ({ h1: document.querySelectorAll('h1').length, sobra: document.documentElement.scrollWidth - innerWidth }));
  ok(`${w}px: sem erros no console`, erros.length === 0, erros.join(' | '));
  ok(`${w}px: um único h1`, r.h1 === 1, `${r.h1}`);
  ok(`${w}px: sem rolagem lateral`, r.sobra <= 0, `${r.sobra}px`);
  await ctx.close();
}

// 2. SEO e dados estruturados
{
  const { ctx, p } = await abre(1440, 900);
  const s = await p.evaluate(() => ({
    titulo: document.title, lang: document.documentElement.lang,
    desc: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    og: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent),
  }));
  ok('Título com "Carro 0 km em Aracruz"', /carro 0 km em aracruz/i.test(s.titulo), s.titulo);
  ok('Descrição com "Aracruz"', /aracruz/i.test(s.desc));
  ok('lang="pt-BR"', s.lang === 'pt-BR');
  ok('Imagem de compartilhamento (og:image)', !!s.og);
  let tipos = [];
  try { tipos = JSON.parse(s.ld[0])['@graph'].map(x => x['@type']); } catch { /* fica vazio */ }
  ok('schema.org AutoDealer + Person', tipos.includes('AutoDealer') && tipos.includes('Person'), tipos.join(', '));
  await ctx.close();
}

// 3. WhatsApp: todos os links, mensagens por intenção e categoria propagada
{
  const { ctx, p } = await abre(1440, 900);
  const links = await p.$$eval('a[data-wa]', as => as.map(a => ({ wa: a.dataset.wa, href: a.href, cat: a.dataset.cat || '', semCat: a.hasAttribute('data-sem-cat') })));
  ok('Todos os links de WhatsApp vão para o número certo', links.length > 0 && links.every(l => l.href.startsWith(`https://wa.me/${NUMERO}?text=`)), `${links.length} links`);
  ok('Todas as mensagens começam com a saudação', links.every(l => texto(l.href).startsWith(OI)));
  for (const [intencao, msg] of Object.entries(ESPERADO)) {
    const semCategoria = links.filter(l => l.wa === intencao && !l.cat);
    ok(`Intenção "${intencao}": mensagem pronta`, semCategoria.length > 0 && semCategoria.every(l => texto(l.href) === msg), `${semCategoria.length} links`);
  }
  const alvo = { SUV: 'um SUV', Picape: 'uma picape', Hatch: 'um hatch', 'Sedã': 'um sedã', 'Elétrico/Híbrido': 'um elétrico ou híbrido' };
  for (const [cat, a] of Object.entries(alvo)) {
    const l = links.find(x => x.cat === cat);
    ok(`Cartão ${cat}: mensagem com a categoria`, !!l && texto(l.href) === `${OI}quero encontrar meu próximo carro. Estou procurando ${a}.`);
  }
  await semNovasAbas(p);
  await p.click('.c-picape a');
  const depois = await p.evaluate(() => ({
    topo: (document.querySelector('.topo-cta')).href,
    cond: (document.querySelector('.intencao[data-wa="condicoes"]')).href,
    chip: (document.querySelector('[data-chips] input[value="Picape"]')).checked,
  }));
  ok('Escolher "Picape" muda o botão do topo', texto(depois.topo).endsWith('Estou procurando uma picape.'));
  ok('Escolher "Picape" muda "Quero saber as condições"', texto(depois.cond) === `${OI}quero saber as condições para uma picape.`);
  ok('Escolher "Picape" marca o chip do fechamento', depois.chip);
  await p.locator('[data-chips] label', { hasText: 'Sedã' }).click();
  const usado = await p.$eval('.intencao[data-wa="usado"]', a => (a).href);
  ok('Chip "Sedã" muda "Quero avaliar meu usado"', texto(usado) === `${OI}quero avaliar meu usado na troca por um sedã. Meu carro atual é: `);
  await ctx.close();
}

// 4. Galeria: filtros, contagem, tela cheia respeitando o filtro; vídeos
{
  const { ctx, p, erros } = await abre(1440, 900);
  await p.locator('#entregas').scrollIntoViewIfNeeded();
  await p.waitForSelector('astro-island:not([ssr]) .gal', { timeout: 10000 });
  const todas = await p.locator('.gal-trilho > li').count();
  const filtro = p.locator('.gal-filtro', { hasText: 'Picape' });
  const n = Number((await filtro.locator('.gal-filtro-n').textContent()).trim());
  await filtro.click();
  await p.waitForTimeout(500);
  const slides = await p.locator('.gal-trilho > li').count();
  const tags = await p.$$eval('.gal-trilho > li .gal-tags', ts => ts.map(t => t.textContent));
  ok('Filtro "Picape": contagem bate com o número no botão', slides === n && n > 0, `${slides} de ${todas}`);
  ok('Filtro "Picape": só picapes', tags.every(t => /picape/i.test(t)));
  ok('Filtro marcado com aria-pressed', (await filtro.getAttribute('aria-pressed')) === 'true');
  await p.locator('.gal-foto').first().click();
  await p.waitForSelector('.yarl__root', { timeout: 5000 });
  const contador = (await p.locator('.yarl__counter').textContent())?.replace(/\s/g, '');
  ok('Tela cheia abre só com as fotos do filtro', contador === `1/${n}`, contador);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(600);
  ok('Tela cheia fecha com Esc', (await p.locator('.yarl__root').count()) === 0);
  ok('Botão de pausar/reproduzir presente', (await p.locator('.gal-play').count()) === 1);

  await p.locator('[data-video]').first().scrollIntoViewIfNeeded();
  await p.locator('[data-video]').first().click();
  await p.waitForTimeout(2500);
  const v = await p.evaluate(() => { const v = document.querySelector('[data-videos] video'); return v && { erro: v.error?.code ?? 0, pronto: v.readyState, src: v.currentSrc }; });
  ok('Vídeo carrega ao apertar o play', !!v && v.erro === 0 && v.pronto >= 1, v ? `${v.src.split('/').pop()} readyState=${v.pronto}` : 'sem vídeo');
  ok('Galeria e vídeos sem erros', erros.length === 0, erros.join(' | '));
  await ctx.close();
}

// 5. Celular: menu, botão fixo, assinatura sem sobreposição
{
  const { ctx, p } = await abre(390, 844);
  await p.click('.menu-bt');
  await p.waitForTimeout(500);
  ok('Menu abre', await p.locator('#menu').isVisible() && (await p.getAttribute('.menu-bt', 'aria-expanded')) === 'true');
  await p.keyboard.press('Tab');
  ok('Foco fica dentro do menu', await p.evaluate(() => !!document.activeElement?.closest('#menu, .menu-bt')));
  await p.keyboard.press('Escape');
  await p.waitForTimeout(800);
  ok('Menu fecha com Esc e devolve o foco', (await p.getAttribute('.menu-bt', 'aria-expanded')) === 'false' && await p.evaluate(() => document.activeElement?.classList.contains('menu-bt')));

  const fixo = () => p.evaluate(() => document.querySelector('.wa-fixo').classList.contains('visivel'));
  ok('Botão fixo escondido no topo', !(await fixo()));
  await p.evaluate(() => scrollTo(0, document.getElementById('duvidas').offsetTop + 120));
  await p.waitForTimeout(700);
  ok('Botão fixo aparece depois do topo', await fixo());
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(700);
  ok('Botão fixo some no rodapé', !(await fixo()));
  await ctx.close();
}
for (const [w, h] of [[390, 844], [390, 664], [360, 600], [768, 1024], [1280, 720], [1440, 900]]) {
  const { ctx, p } = await abre(w, h);
  const cv = await p.evaluate(() => { const c = document.querySelector('[data-assinatura]'); return { top: c.getBoundingClientRect().top + scrollY, h: c.offsetHeight, vivo: c.classList.contains('cv--vivo') }; });
  await p.evaluate(y => scrollTo(0, y), cv.top + cv.h - h);
  await p.waitForTimeout(1300);
  const r = await p.evaluate(() => {
    const rs = [...document.querySelectorAll('.cv .chip')].map(e => e.getBoundingClientRect());
    const no = document.querySelector('.cv-circulo').getBoundingClientRect(), bt = document.querySelector('.cv-acao .btn').getBoundingClientRect();
    const bate = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    let n = 0;
    rs.forEach((a, i) => { rs.forEach((b, j) => { if (j > i && bate(a, b)) n++; }); if (bate(a, no) || bate(a, bt)) n++; });
    return { n, botao: bt.top >= 0 && bt.bottom <= innerHeight && getComputedStyle(document.querySelector('.cv-acao')).visibility === 'visible' };
  });
  ok(`Assinatura ${w}×${h}: logos sem sobreposição`, r.n === 0, `${cv.vivo ? 'animada' : 'parada'}, ${r.n}`);
  ok(`Assinatura ${w}×${h}: botão visível no fim`, r.botao);
  await ctx.close();
}

// 6. Hodômetro termina nos números certos
{
  const { ctx, p } = await abre(1440, 900);
  await p.locator('.numeros').scrollIntoViewIfNeeded();
  await p.waitForTimeout(2800);
  const lidos = await p.$$eval('.numeros .odo', odos => odos.map(o => [...o.querySelectorAll('.jan')].map(j => {
    const f = j.querySelector('.faixa'), ty = new DOMMatrix(getComputedStyle(f).transform).m42, alt = (f.firstElementChild).offsetHeight;
    return f.children[Math.round(-ty / alt)]?.textContent;
  }).join('')));
  const esperados = await p.$$eval('.numeros .instr .sr', ss => ss.map(s => (s.textContent.match(/[\d.]+/) || [''])[0].replace(/\./g, '')));
  ok('Hodômetro para nos valores reais', JSON.stringify(lidos) === JSON.stringify(esperados), `${lidos.join(', ')} / ${esperados.join(', ')}`);
  await ctx.close();
}

// 7. Reduzir movimento e sem JavaScript: tudo legível e parado
{
  const { ctx, p, erros } = await abre(390, 844, { reducedMotion: 'reduce' });
  await percorre(p);
  await p.waitForTimeout(1000);
  const r = await p.evaluate(() => ({
    vivo: document.querySelector('[data-assinatura]').classList.contains('cv--vivo'),
    escondidos: [...document.querySelectorAll('.rv, .rv-foto')].filter(e => getComputedStyle(e).opacity !== '1').length,
  }));
  ok('Reduzir movimento: assinatura parada', !r.vivo);
  ok('Reduzir movimento: nada fica escondido depois de rolar', r.escondidos === 0, `${r.escondidos}`);
  ok('Reduzir movimento: sem erros', erros.length === 0, erros.join(' | '));
  await ctx.close();
}
{
  const { ctx, p } = await abre(390, 844, { javaScriptEnabled: false });
  const r = await p.evaluate(() => ({
    h1: (document.querySelector('h1')).innerText.trim(),
    escondidos: [...document.querySelectorAll('.rv, .rv-foto, .tit')].filter(e => getComputedStyle(e).opacity !== '1').length,
    fotos: [...document.querySelectorAll('.gal-trilho > li')].filter(e => getComputedStyle(e).opacity === '1').length,
    menu: getComputedStyle(document.querySelector('.menu-bt')).display,
  }));
  ok('Sem JS: título legível', r.h1.length > 10, r.h1);
  ok('Sem JS: nenhum bloco escondido', r.escondidos === 0, `${r.escondidos}`);
  ok('Sem JS: fotos das entregas visíveis', r.fotos >= 10, `${r.fotos}`);
  ok('Sem JS: sem botão de menu que não abre', r.menu === 'none');
  await ctx.close();
}

// 8. Acessibilidade (axe): nada sério ou crítico
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const { ctx, p } = await abre(w, h);
  await percorre(p);
  await p.waitForTimeout(1200);
  const res = await new AxeBuilder({ page: p }).analyze();
  const graves = res.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
  ok(`axe ${w}px: sem violações sérias/críticas`, graves.length === 0, res.violations.map(v => `${v.impact} ${v.id} (${v.nodes.length})`).join(' | ') || 'nenhuma');
  await ctx.close();
}

await browser.close();
srv.close();
console.log(`\n${total - falhas}/${total} verificações passaram.`);
process.exit(falhas ? 1 : 0);
