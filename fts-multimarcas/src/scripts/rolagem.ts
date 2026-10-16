// Rolagem: um controlador leve (progresso de cena + suavização) e o Lenis, só no desktop com mouse.
// Substitui o GSAP ScrollTrigger: as duas cenas do site só precisam de "quanto da seção já passou".
import type Lenis from 'lenis';

export const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis: Lenis | null = null;
let iniciado = false;

/** Altura do cabeçalho fixo, para as âncoras não ficarem escondidas atrás dele. */
const alturaTopo = () => (document.getElementById('topo')?.offsetHeight ?? 64) + 12;

export function iniciarRolagem() {
  if (iniciado) return;
  iniciado = true;
  const desktopComMouse = matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
  if (reduz || !desktopComMouse) return;
  // O Lenis só é baixado no desktop com mouse; no celular a rolagem é a nativa.
  import('lenis').then(({ default: L }) => ligarLenis(new L({ lerp: 0.12, wheelMultiplier: 1, anchors: false, autoRaf: true })));
}

function ligarLenis(l: Lenis) {
  lenis = l;
  // Âncoras internas passam pelo Lenis, com o desconto do cabeçalho.
  document.addEventListener('click', e => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || !lenis) return;
    const id = a.getAttribute('href')!.slice(1);
    const alvo = id ? document.getElementById(id) : null;
    if (!alvo) return;
    e.preventDefault();
    lenis.scrollTo(alvo, { offset: -alturaTopo(), duration: 1.1 });
    history.replaceState(null, '', '#' + id);
    // Leva o foco junto, para teclado e leitor de tela.
    alvo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
  });
}

export const pararRolagem = () => lenis?.stop();
export const voltarRolagem = () => lenis?.start();

type Cena = {
  /** Progresso 0–1 desejado para a posição atual da página. */
  alvo: () => number;
  /** Desenha o estado para um progresso. */
  desenha: (p: number) => void;
  /** Suavização por quadro (1 = sem suavizar). */
  suave: number;
  p: number;
  ativa: boolean;
};
const cenas: Cena[] = [];
let pedido = 0;

function quadro() {
  pedido = 0;
  let falta = false;
  for (const c of cenas) {
    if (!c.ativa) continue;
    const a = c.alvo(), d = a - c.p;
    c.p = Math.abs(d) < 0.0008 ? a : c.p + d * c.suave;
    c.desenha(c.p);
    if (c.p !== a) falta = true;
  }
  if (falta) pede();
}
const pede = () => { if (!pedido) pedido = requestAnimationFrame(quadro); };
addEventListener('scroll', pede, { passive: true });
addEventListener('resize', pede);

/** Liga uma cena conduzida pela rolagem. Devolve controles para ligar/desligar e redesenhar. */
export function cena(alvo: Cena['alvo'], desenha: Cena['desenha'], suave = 0.16) {
  const c: Cena = { alvo, desenha, suave, p: alvo(), ativa: true };
  cenas.push(c);
  desenha(c.p);
  return {
    ligar(sim: boolean) { c.ativa = sim; if (sim) { c.p = alvo(); desenha(c.p); } },
    atualizar() { pede(); },
    get p() { return c.p; },
  };
}

/** Progresso de um elemento entre dois pontos da tela (frações da altura da janela), como "top 78%" → "bottom 55%". */
export function entre(el: HTMLElement, inicio: number, fim: number) {
  const r = el.getBoundingClientRect(), h = innerHeight;
  const total = inicio * h - (fim * h - r.height);
  return Math.max(0, Math.min(1, (inicio * h - r.top) / total));
}
