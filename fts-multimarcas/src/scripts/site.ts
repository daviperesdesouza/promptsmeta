// Comportamentos gerais do site: abertura, revelações, hodômetro, rota, WhatsApp, menu.
import { linkWhatsApp, type Intencao } from '../lib/whatsapp';
import { reduz, iniciarRolagem, pararRolagem, voltarRolagem, cena, entre } from './rolagem';

const doc = document.documentElement;
const $ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => c.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => [...c.querySelectorAll<T>(s)];

iniciarRolagem();

/* ---------- Títulos: revelação por máscara, linha a linha ---------- */
const embrulha = (no: Node) => [...no.childNodes].forEach(n => {
  if (n.nodeType === 3) {
    const frag = document.createDocumentFragment();
    (n.textContent || '').split(/(\s+)/).forEach(p => {
      if (!p) return;
      if (/^\s+$/.test(p)) { frag.append(p); return; }
      const w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      const wi = document.createElement('span'); wi.className = 'wi'; wi.textContent = p;
      w.append(wi); frag.append(w);
    });
    n.replaceWith(frag);
  } else if (n.nodeType === 1 && !(n as Element).classList.contains('pend')) embrulha(n);
});
const titulos = $$('.tit').filter(t => !t.querySelector('.w')); // o do topo já vem separado do build
titulos.forEach(t => { t.setAttribute('aria-label', (t.textContent || '').trim().replace(/\s+/g, ' ')); embrulha(t); });
const atrasos = () => titulos.forEach(t => {
  let topo: number | null = null, linha = -1, k = 0;
  $$<HTMLElement>('.wi', t).forEach(wi => {
    const y = (wi.parentElement as HTMLElement).offsetTop;
    if (y !== topo) { linha++; topo = y; k = 0; }
    wi.style.transitionDelay = `${linha * 0.11 + k++ * 0.025}s`;
  });
});
atrasos();
document.fonts?.ready.then(atrasos);

/* ---------- Revelações ao rolar + hodômetro ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('dentro');
  if (e.target.classList.contains('odo')) e.target.classList.add('rodou');
  io.unobserve(e.target);
}), { rootMargin: '0px 0px -12% 0px' });
$$('.rv, .rv-foto, .tit:not(.tit--abertura), .odo').forEach(el => io.observe(el));

/* ---------- Rota do "Como funciona": a linha verde avança com a rolagem ---------- */
const rota = $('[data-rota]');
if (rota) {
  const paradas = $$('.parada', rota);
  if (reduz) { rota.style.setProperty('--p', '1'); paradas.forEach(p => p.classList.add('chegou')); }
  else {
    // A linha começa quando a rota passa de 78% da tela e chega ao fim quando a base dela passa de 55%.
    cena(() => entre(rota, 0.78, 0.55), p => {
      rota.style.setProperty('--p', p.toFixed(4));
      paradas.forEach((el, i) => el.classList.toggle('chegou', p >= i / Math.max(1, paradas.length - 1) - 0.02));
    }, 0.2);
  }
}

/* ---------- Cabeçalho ao rolar + seção atual no menu ---------- */
const topo = $('#topo');
const marcaTopo = () => topo?.classList.toggle('rolou', scrollY > 8);
addEventListener('scroll', marcaTopo, { passive: true }); marcaTopo();
const linksNav = $$<HTMLAnchorElement>('.nav a');
// Observa todas as seções: numa seção fora do menu (topo, contato...), nenhum link fica marcado.
const navObs = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  linksNav.forEach(a => {
    const atual = a.hash === '#' + e.target.id;
    a.classList.toggle('atual', atual);
    if (atual) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
  });
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main > section, footer').forEach(s => navObs.observe(s));

/* ---------- WhatsApp: a categoria escolhida entra em todas as mensagens ---------- */
const NUMERO = (document.querySelector<HTMLAnchorElement>('a[data-wa]')?.href.match(/wa\.me\/(\d+)/) || [])[1] || '';
let categoria = '';
const atualizaLinks = () => $$<HTMLAnchorElement>('a[data-wa]').forEach(a => {
  if (a.hasAttribute('data-cat') || a.hasAttribute('data-sem-cat')) return;
  a.href = linkWhatsApp(NUMERO, a.dataset.wa as Intencao, categoria);
});
$$<HTMLAnchorElement>('a[data-cat]').forEach(a => a.addEventListener('click', () => {
  const c = a.dataset.cat!;
  if (c === 'Empresas') return;
  categoria = c;
  $$<HTMLInputElement>('[data-chips] input').forEach(i => { i.checked = i.value === categoria; });
  atualizaLinks();
}));
$$<HTMLInputElement>('[data-chips] input').forEach(i => i.addEventListener('change', () => { categoria = i.value; atualizaLinks(); }));

/* ---------- Botão fixo: depois do topo, e nunca por cima de outro botão ---------- */
const fixo = $<HTMLAnchorElement>('[data-wa-fixo]');
if (fixo) {
  let passouTopo = false;
  const cobrindo = new Set<Element>();
  const decide = () => {
    const v = passouTopo && cobrindo.size === 0 && !doc.classList.contains('menu-aberto');
    fixo.classList.toggle('visivel', v); fixo.tabIndex = v ? 0 : -1;
  };
  const hero = $('.hero');
  if (hero) new IntersectionObserver(([e]) => { passouTopo = !e.isIntersecting && e.boundingClientRect.top < 0; decide(); }).observe(hero);
  // Faixa de baixo da tela, onde o botão fixo fica.
  const zona = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? cobrindo.add(e.target) : cobrindo.delete(e.target)); decide(); }, { rootMargin: '-80% 0px 0px 0px' });
  $$('[data-cta], .cat, .gal-ctrl, .gal-carrossel, .rodape .rod-grade, .rod-base, [data-chips], .intencoes, .videos-grade, [data-assinatura]').forEach(el => zona.observe(el));
  (window as any).__fixo = decide;
}

/* ---------- Menu mobile ---------- */
const menuBt = $<HTMLButtonElement>('.menu-bt');
const menu = $('#menu');
if (menuBt && menu) {
  const txt = $('.menu-bt-tx', menuBt)!;
  const aberto = () => doc.classList.contains('menu-aberto');
  const abre = () => {
    menu.hidden = false;
    requestAnimationFrame(() => { doc.classList.add('menu-aberto'); });
    menuBt.setAttribute('aria-expanded', 'true'); txt.textContent = 'Fechar';
    pararRolagem(); (window as any).__fixo?.();
    setTimeout(() => $('a', menu)?.focus({ preventScroll: true }), reduz ? 0 : 320);
  };
  const fecha = (foco = true) => {
    doc.classList.remove('menu-aberto');
    menuBt.setAttribute('aria-expanded', 'false'); txt.textContent = 'Menu';
    voltarRolagem(); (window as any).__fixo?.();
    setTimeout(() => { if (!aberto()) menu.hidden = true; }, reduz ? 0 : 700);
    if (foco) menuBt.focus();
  };
  menuBt.addEventListener('click', () => (aberto() ? fecha() : abre()));
  menu.addEventListener('click', e => { if ((e.target as Element).closest('a')) fecha(false); });
  document.addEventListener('keydown', e => {
    if (!aberto()) return;
    if (e.key === 'Escape') fecha();
    if (e.key === 'Tab') {
      const foco = [menuBt, ...$$<HTMLElement>('a', menu)];
      const i = foco.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      foco[(i + (e.shiftKey ? -1 : 1) + foco.length) % foco.length].focus();
    }
  });
}

