// Galeria de entregas (ilha React): filtro por tipo, carrossel e tela cheia sincronizados.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import './galeria.css';

export interface FotoEntrega {
  id: string; cliente: string; cidade: string; carro: string; tipo: string; hibrido: boolean; marca: string;
  alt: string; formato: 'v' | 'h'; w: number; h: number;
  avif: string; webp: string; src: string;
  grande: { src: string; w: number; h: number };
}

const ORDEM = ['SUV', 'Picape', 'Hatch', 'Sedã', 'Elétrico'];

/** "Reduzir movimento", lido só depois de montar: o primeiro desenho fica igual ao HTML do servidor. */
function useReduz() {
  const [reduz, setReduz] = useState(false);
  useEffect(() => {
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setReduz(m.matches);
    f(); m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return reduz;
}

export default function Galeria({ fotos }: { fotos: FotoEntrega[] }) {
  const reduz = useReduz();
  // As fotos só entram animadas depois de uma troca de filtro; no carregamento (e sem JS) já aparecem.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const filtros = useMemo(() => {
    const tipos = ORDEM.filter(t => fotos.some(f => f.tipo === t));
    const lista = [{ id: 'Todas', n: fotos.length }, ...tipos.map(t => ({ id: t, n: fotos.filter(f => f.tipo === t).length }))];
    const hib = fotos.filter(f => f.hibrido).length;
    if (hib) lista.push({ id: 'Híbrido', n: hib });
    return lista;
  }, [fotos]);
  const [filtro, setFiltro] = useState('Todas');
  const visiveis = useMemo(() => fotos.filter(f => filtro === 'Todas' || (filtro === 'Híbrido' ? f.hibrido : f.tipo === filtro)), [fotos, filtro]);

  const autoplay = useRef(Autoplay({ delay: 4200, playOnInit: false, stopOnInteraction: true, stopOnMouseEnter: true, stopOnFocusIn: true }));
  const [emblaRef, embla] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', skipSnaps: false }, [autoplay.current]);
  const [faixa, setFaixa] = useState({ de: 1, ate: 1 });
  const [progresso, setProgresso] = useState(0);
  const [pode, setPode] = useState({ ant: false, prox: true });
  const [tocando, setTocando] = useState(false);
  const [pausadoPelaPessoa, setPausadoPelaPessoa] = useState(false);
  const [aberta, setAberta] = useState(-1);
  const raiz = useRef<HTMLDivElement>(null);

  const atualiza = useCallback(() => {
    if (!embla) return;
    const vis = embla.slidesInView();
    if (vis.length) setFaixa({ de: Math.min(...vis) + 1, ate: Math.max(...vis) + 1 });
    setProgresso(Math.max(0, Math.min(1, embla.scrollProgress())));
    setPode({ ant: embla.canScrollPrev(), prox: embla.canScrollNext() });
  }, [embla]);

  useEffect(() => {
    if (!embla) return;
    atualiza();
    embla.on('select', atualiza).on('scroll', atualiza).on('reInit', atualiza).on('slidesInView', atualiza);
    const ap = autoplay.current;
    const play = () => setTocando(true), stop = () => setTocando(false);
    embla.on('autoplay:play', play).on('autoplay:stop', stop);
    return () => { embla.off('select', atualiza).off('scroll', atualiza).off('reInit', atualiza).off('slidesInView', atualiza); embla.off('autoplay:play', play).off('autoplay:stop', stop); void ap; };
  }, [embla, atualiza]);

  // Passa sozinho só com o carrossel na tela, e nunca com "reduzir movimento".
  useEffect(() => {
    if (!embla || !raiz.current) return;
    const ap = autoplay.current;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduz && !pausadoPelaPessoa) ap.play(); else ap.stop();
    }, { threshold: 0.35 });
    io.observe(raiz.current);
    return () => io.disconnect();
  }, [embla, reduz, pausadoPelaPessoa]);

  // Trocou o filtro: volta para o começo e remede o carrossel.
  useEffect(() => { if (embla) { embla.reInit(); embla.scrollTo(0, true); atualiza(); } }, [filtro, embla, atualiza]);

  const parar = () => { setPausadoPelaPessoa(true); autoplay.current.stop(); };

  // Pílula do filtro desliza do botão antigo para o novo (Web Animations, sem biblioteca).
  const pilula = useRef<HTMLSpanElement>(null);
  const de = useRef<DOMRect | null>(null);
  const escolhe = (id: string) => {
    if (id === filtro) return;
    de.current = pilula.current?.getBoundingClientRect() ?? null;
    setFiltro(id); parar();
  };
  useLayoutEffect(() => {
    const el = pilula.current, a = de.current;
    de.current = null;
    if (!el || !a || reduz) return;
    const b = el.getBoundingClientRect();
    el.animate([
      { transform: `translateX(${a.left - b.left}px)`, width: `${a.width}px` },
      { transform: 'none', width: `${b.width}px` },
    ], { duration: 460, easing: 'cubic-bezier(.34, 1.25, .64, 1)' });
  }, [filtro, reduz]);
  const alternar = () => {
    if (tocando) parar();
    else { setPausadoPelaPessoa(false); autoplay.current.play(); }
  };
  const ir = (d: number) => { parar(); if (!embla) return; d > 0 ? (embla.canScrollNext() ? embla.scrollNext() : embla.scrollTo(0)) : embla.scrollPrev(); };

  const slides = visiveis.map(f => ({
    src: f.grande.src, width: f.grande.w, height: f.grande.h, alt: f.alt,
    title: `${f.cliente} · ${f.cidade}`, description: `${f.carro}${f.hibrido ? ' · Híbrido' : ''}`,
  }));

  return (
    <div className="gal" ref={raiz}>
      <div className="gal-filtros" role="group" aria-label="Filtrar entregas por tipo de carro">
        {filtros.map(f => (
          <button key={f.id} type="button" className="gal-filtro" aria-pressed={filtro === f.id} onClick={() => escolhe(f.id)}>
            {filtro === f.id && <span className="gal-pilula" ref={pilula} />}
            <span className="gal-filtro-tx">{f.id}</span>
            <span className="gal-filtro-n">{f.n}</span>
          </button>
        ))}
      </div>

      <div className="gal-carrossel" role="region" aria-roledescription="carrossel" aria-label="Fotos de entregas"
        onKeyDown={e => { if (e.key === 'ArrowRight') { e.preventDefault(); ir(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); ir(-1); } }}>
        <div className="gal-viewport" ref={emblaRef}>
          <ul className="gal-trilho">
            {visiveis.map((f, i) => (
              <li key={`${filtro}-${f.id}`} className={`gal-slide gal-slide--${f.formato}${montado ? ' gal-slide--entra' : ''}`}
                style={{ '--n': Math.min(i, 5) } as CSSProperties}>
                <button type="button" className="gal-foto" onClick={() => setAberta(i)} aria-label={`Ver em tela cheia: ${f.cliente}, ${f.cidade}, ${f.carro}`}>
                  <picture>
                    <source type="image/avif" srcSet={f.avif} sizes={f.formato === 'h' ? '(min-width: 900px) 590px, 86vw' : '(min-width: 900px) 360px, 66vw'} />
                    <source type="image/webp" srcSet={f.webp} sizes={f.formato === 'h' ? '(min-width: 900px) 590px, 86vw' : '(min-width: 900px) 360px, 66vw'} />
                    <img src={f.src} alt={f.alt} width={f.w} height={f.h} loading="lazy" decoding="async" draggable={false} />
                  </picture>
                </button>
                <div className="gal-leg">
                  <p className="gal-nome">{f.cliente} <span>· {f.cidade}</span></p>
                  <p className="gal-carro">{f.carro}</p>
                  <p className="gal-tags"><span>{f.tipo}</span>{f.hibrido && <span>Híbrido</span>}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <button type="button" className="gal-seta gal-seta--ant" onClick={() => ir(-1)} disabled={!pode.ant} aria-label="Fotos anteriores">
          <svg aria-hidden="true"><use href="#i-esq" /></svg>
        </button>
        <button type="button" className="gal-seta gal-seta--prox" onClick={() => ir(1)} aria-label="Próximas fotos">
          <svg aria-hidden="true"><use href="#i-dir" /></svg>
        </button>
      </div>

      <div className="gal-ctrl">
        <p className="gal-cont" aria-live="polite">{faixa.de === faixa.ate ? faixa.de : `${faixa.de}–${faixa.ate}`} <span>de {visiveis.length}</span></p>
        <span className="gal-barra" aria-hidden="true"><i style={{ transform: `scaleX(${Math.max(0.06, progresso)})` }} /></span>
        {!reduz && (
          <button type="button" className="gal-play" onClick={alternar} aria-pressed={tocando}>
            <span className={tocando ? 'ic-pausa' : 'ic-play'} aria-hidden="true" />{tocando ? 'Pausar' : 'Reproduzir'}
          </button>
        )}
      </div>

      <Lightbox
        open={aberta >= 0}
        index={Math.max(0, aberta)}
        close={() => setAberta(-1)}
        slides={slides}
        plugins={[Captions, Counter]}
        captions={{ descriptionTextAlign: 'center', descriptionMaxLines: 2 }}
        counter={{ container: { style: { top: 'unset', bottom: 0 } } }}
        animation={reduz ? { fade: 0, swipe: 0 } : { fade: 250, swipe: 420 }}
        controller={{ closeOnBackdropClick: true }}
        labels={{ Previous: 'Foto anterior', Next: 'Próxima foto', Close: 'Fechar', Caption: 'Legenda', Lightbox: 'Entregas em tela cheia', Carousel: 'Fotos', Slide: 'Foto', 'Photo gallery': 'Galeria de entregas' }}
      />
    </div>
  );
}
