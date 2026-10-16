// Assinatura "14 marcas → 1 consultor": os logos soltam rotas que convergem para o Fabricio.
// A rolagem conduz o desenho (cena com suavização, em rolagem.ts). Sem JS, com reduzir movimento
// ou numa tela baixa demais, a seção fica parada e completa (estado definido no CSS).
import { reduz, iniciarRolagem, cena, entre } from './rolagem';

const NS = 'http://www.w3.org/2000/svg';
const cl = (v: number) => Math.max(0, Math.min(1, v));
type Caixa = { x: number; y: number; w: number; h: number };
const bate = (a: Caixa, b: Caixa, m = 0) =>
  a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

/** n pontos num arco de elipse, com o mesmo espaço entre caixas (u × v) vizinhas. */
function arco(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, u: number, v: number, n: number) {
  const N = 900, pts: [number, number][] = [], acc = [0];
  for (let k = 0; k <= N; k++) {
    const t = ((a0 + ((a1 - a0) * k) / N) * Math.PI) / 180;
    pts.push([cx + rx * Math.cos(t), cy - ry * Math.sin(t)]);
    if (k) acc.push(acc[k - 1] + Math.max(Math.abs(pts[k][0] - pts[k - 1][0]) / u, Math.abs(pts[k][1] - pts[k - 1][1]) / v));
  }
  const out: [number, number][] = [];
  for (let i = 0, k = 0; i < n; i++) {
    const alvo = (acc[N] * i) / (n - 1);
    while (k < N && acc[k] < alvo) k++;
    out.push(pts[k]);
  }
  return out;
}

export function iniciarAssinatura() {
  const cv = document.querySelector<HTMLElement>('[data-assinatura]');
  if (!cv || reduz) return;
  iniciarRolagem();

  const quadro = cv.querySelector<HTMLElement>('.cv-quadro')!;
  const textos = cv.querySelector<HTMLElement>('.cv-textos')!;
  const chips = [...cv.querySelectorAll<HTMLElement>('.chip')];
  const svg = cv.querySelector<SVGSVGElement>('.cv-svg')!;
  const no = cv.querySelector<HTMLElement>('.cv-no')!;
  const acao = cv.querySelector<HTMLElement>('.cv-acao')!;
  const fases = [...cv.querySelectorAll<HTMLElement>('.cv-fase')];

  let paths: SVGPathElement[] = [], pontos: SVGCircleElement[] = [], lens: number[] = [];

  /** Calcula o desenho para o tamanho atual. Devolve false se não couber (fica o estado parado). */
  function monta(): boolean {
    cv!.classList.add('cv--vivo');
    cv!.classList.remove('cv--compacto');
    const W = quadro.clientWidth, H = quadro.clientHeight;
    if (H < 520) return false;
    const g = parseFloat(getComputedStyle(quadro).paddingLeft) || 16;
    const hh = document.getElementById('topo')?.offsetHeight ?? 64;
    const mob = W < 900;
    const caixas: Caixa[] = [];
    const saidas: { x: number; y: number; lado: number }[] = [];
    let cx: number, cy: number, r: number, cw: number, ch: number, ax: number, ay: number;

    if (!mob) {
      // Desktop: dois arcos alternados de logos à esquerda do retrato; o botão fica sob o texto.
      const topoU = hh + 18, baseU = H - 22;
      const cd = Math.round(Math.min(210, Math.max(150, W * 0.13))); r = cd / 2;
      cx = W - g - r - 14; cy = Math.round((topoU + baseU) / 2);
      const tR = textos.offsetLeft + textos.offsetWidth;
      const zonaNo: Caixa = { x: cx - r - 16, y: cy - r - 16, w: cd + 32, h: cd + 32 };
      let achou: { pts: [number, number][]; cw: number; ch: number } | null = null;
      for (let w0 = 120; w0 >= 76 && !achou; w0 -= 4) {
        const h0 = Math.round(w0 * 0.5);
        const rx = cx - (tR + 44 + w0 / 2), ry = Math.min(cy - topoU - h0 / 2, baseU - h0 / 2 - cy);
        if (rx < 150 || ry < 110) continue;
        const fora = arco(cx, cy, rx, ry, 98, 262, w0 + 18, h0 + 16, 14);
        const dentro = arco(cx, cy, rx * 0.64, ry * 0.64, 98, 262, w0 + 18, h0 + 16, 14);
        const pts = chips.map((_, i) => (i % 2 ? dentro[i] : fora[i]));
        const cs = pts.map(([x, y]) => ({ x: x - w0 / 2, y: y - h0 / 2, w: w0, h: h0 }));
        const ok = cs.every((a, i) => !bate(a, zonaNo, 4) && a.y >= topoU - 2 && a.y + a.h <= baseU + 2
          && a.x >= tR + 20 && cs.every((b, j) => j <= i || !bate(a, b, 8)));
        if (ok || w0 <= 76) achou = { pts, cw: w0, ch: h0 };
      }
      if (!achou) return false;
      cw = achou.cw; ch = achou.ch;
      achou.pts.forEach(([x, y]) => { caixas.push({ x: x - cw / 2, y: y - ch / 2, w: cw, h: ch }); saidas.push({ x, y, lado: 0 }); });
      no.style.setProperty('--cd', cd + 'px');
      // .cv-textos é centrado com translateY(-50%): a base visual fica em top + altura/2.
      ax = textos.offsetLeft; ay = textos.offsetTop + textos.offsetHeight / 2 + 26;
    } else {
      // Celular: duas colunas; as rotas saem por dentro e descem num feixe central até o retrato.
      const cd = Math.round(Math.min(116, Math.max(88, W * 0.26))); r = cd / 2;
      no.style.setProperty('--cd', cd + 'px');
      const acaoH = acao.offsetHeight || 56;
      const espaco = () => H - 18 - (textos.offsetTop + textos.offsetHeight + 18) - (cd + 18 + acaoH) - 22;
      let livre = espaco();
      if (livre / 7 < 38) { cv!.classList.add('cv--compacto'); livre = espaco(); }
      if (livre / 7 < 36) return false; // logos pequenos demais: melhor a versão parada
      const topo0 = textos.offsetTop + textos.offsetHeight + 18;
      const rowH = Math.min(56, livre / 7);
      ch = Math.round(Math.min(44, rowH - 8)); cw = Math.round(Math.min(156, (W - 2 * g - 48) / 2));
      const y0 = topo0 + (livre - 7 * rowH) * 0.4;
      chips.forEach((_, i) => {
        const dir = i % 2, lin = Math.floor(i / 2);
        const x = dir ? W - g - cw : g, y = y0 + lin * rowH + (rowH - ch) / 2;
        caixas.push({ x, y, w: cw, h: ch });
        saidas.push({ x: dir ? x : x + cw, y: y + ch / 2, lado: dir ? 1 : -1 });
      });
      cx = W / 2; cy = y0 + 7 * rowH + 22 + r;
      ax = (W - acao.offsetWidth) / 2; ay = cy + r + 18;
    }

    chips.forEach((c, i) => {
      c.style.setProperty('--x', caixas[i].x + 'px'); c.style.setProperty('--y', caixas[i].y + 'px');
      c.style.setProperty('--cw', cw + 'px'); c.style.setProperty('--ch', ch + 'px');
    });
    no.style.setProperty('--x', cx - r + 'px'); no.style.setProperty('--y', cy - r + 'px');
    acao.style.setProperty('--ax', ax + 'px'); acao.style.setProperty('--ay', ay + 'px');

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    paths = []; pontos = []; lens = [];
    saidas.forEach((s, i) => {
      let d: string;
      if (!mob) {
        const ang = Math.atan2(s.y - cy, s.x - cx);
        const tx = cx + (r + 2) * Math.cos(ang), ty = cy + (r + 2) * Math.sin(ang);
        d = `M${s.x},${s.y} C${s.x + (tx - s.x) * 0.5},${s.y} ${tx - (tx - s.x) * 0.25},${ty + (s.y - ty) * 0.2} ${tx},${ty}`;
      } else {
        const xL = cx + s.lado * (3 + Math.floor(i / 2) * 1.6);
        d = `M${s.x},${s.y} L${xL + s.lado * 10},${s.y} Q${xL},${s.y} ${xL},${s.y + 10} L${xL},${cy - r - 26} Q${xL},${cy - r - 6} ${cx},${cy - r}`;
      }
      const tr = document.createElementNS(NS, 'path'); tr.setAttribute('d', d); tr.setAttribute('class', 'trilho'); svg.append(tr);
      const pa = document.createElementNS(NS, 'path'); pa.setAttribute('d', d); svg.append(pa);
      const L = pa.getTotalLength(); pa.style.strokeDasharray = String(L); lens.push(L); paths.push(pa);
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '3.5'); c.style.opacity = '0'; svg.append(c); pontos.push(c);
    });
    return true;
  }

  let fase = -1;
  function render(p: number) {
    chips.forEach((_, i) => {
      const d = cl((p - 0.04 - i * 0.018) / 0.3), L = lens[i] || 0;
      if (paths[i]) paths[i].style.strokeDashoffset = String(L * (1 - d));
      const pt = pontos[i];
      if (!pt) return;
      if (d > 0 && d < 1) {
        const q = paths[i].getPointAtLength(L * d);
        pt.setAttribute('cx', String(q.x)); pt.setAttribute('cy', String(q.y)); pt.style.opacity = '1';
      } else pt.style.opacity = '0';
    });
    const n = cl((p - 0.4) / 0.18), nb = cl((p - 0.6) / 0.1);
    no.style.setProperty('--ns', String(0.5 + 0.5 * (1 - Math.pow(1 - n, 3))));
    no.style.setProperty('--no', String(n));
    acao.style.setProperty('--nb', String(nb));
    acao.style.visibility = nb > 0.02 ? 'visible' : 'hidden';
    const f = p < 0.28 ? 0 : p < 0.6 ? 1 : 2;
    if (f !== fase) { fase = f; fases.forEach((el, i) => el.classList.toggle('ativa', i === f)); }
  }

  let vivo = monta();
  if (!vivo) cv.classList.remove('cv--vivo', 'cv--compacto');
  render(vivo ? 0 : 1);
  // Do topo da seção no topo da tela até o fim dela no pé da tela.
  const c = cena(() => entre(cv, 0, 1), p => { if (vivo) render(p); }, 0.14);
  c.ligar(vivo);

  // Os logos entram quando o palco aparece na tela.
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { cv.classList.add('cv--entrou'); o.disconnect(); }
  }), { threshold: 0.2 }).observe(cv.querySelector('.cv-palco')!);

  let t: number, larg = innerWidth;
  const refaz = () => {
    const ok = monta();
    if (!ok) cv.classList.remove('cv--vivo', 'cv--compacto');
    if (ok !== vivo) { vivo = ok; c.ligar(ok); }
    render(vivo ? c.p : 1);
  };
  addEventListener('resize', () => {
    // No celular, a barra do navegador muda a altura ao rolar: só refaz quando a largura muda.
    if (innerWidth === larg && matchMedia('(pointer: coarse)').matches) return;
    larg = innerWidth; clearTimeout(t); t = window.setTimeout(refaz, 120);
  });
  document.fonts?.ready.then(refaz);
}
