// Regras derivadas do conteúdo: o que aparece, o que vira pendência, onde estão as imagens.
import type { ImageMetadata } from 'astro';
import { CONFIG, TEXTOS } from '../content/site';
import { linkWhatsApp, type Intencao } from './whatsapp';

export { CONFIG, TEXTOS };
export const revisao = CONFIG.modoRevisao;

/** Link do WhatsApp com a mensagem pronta (a categoria escolhida entra no navegador). */
export const wa = (intencao: Intencao, categoria = '') => linkWhatsApp(CONFIG.whatsapp, intencao, categoria);

/** Serviço aparece se confirmado; se ainda não confirmado, só na revisão. */
export const servicoVisivel = (s: keyof typeof CONFIG.servicos) => CONFIG.servicos[s] === true || (CONFIG.servicos[s] === null && revisao);
export const servicoPendente = (s: keyof typeof CONFIG.servicos) => CONFIG.servicos[s] === null;

/** Números: os não confirmados só aparecem na revisão. */
export const numerosVisiveis = CONFIG.numeros.filter(n => n.confirmado || revisao);

/* ---------- Imagens (importadas no build para o Astro otimizar) ---------- */
const fotosGlob = import.meta.glob<{ default: ImageMetadata }>('../assets/fotos/*.{jpg,jpeg,png,webp}', { eager: true });
const marcasGlob = import.meta.glob<{ default: ImageMetadata }>('../assets/marcas/*.{webp,png,svg,jpg}', { eager: true });
const porNome = (glob: Record<string, { default: ImageMetadata }>) =>
  Object.fromEntries(Object.entries(glob).map(([p, m]) => [p.split('/').pop()!.replace(/\.[a-z]+$/, ''), m.default]));
const FOTOS = porNome(fotosGlob);
const LOGOS = porNome(marcasGlob);

export function foto(nome: string): ImageMetadata {
  const f = FOTOS[nome];
  if (!f) throw new Error(`Foto "${nome}" não encontrada em src/assets/fotos. Confira o nome em src/content/site.ts.`);
  return f;
}
export function logosDa(marca: string): { img: ImageMetadata; nome: string }[] {
  return (CONFIG.logos[marca] || []).filter(n => LOGOS[n]).map(n => ({ img: LOGOS[n], nome: n }));
}

/* ---------- Pendências (lista do rodapé na revisão) ---------- */
export interface Pendencia { item: string; impacto: string }
export function pendencias(): Pendencia[] {
  const p: Pendencia[] = [];
  const add = (item: string, impacto: string) => p.push({ item, impacto });
  if (!CONFIG.whatsapp) add('Número de WhatsApp com DDD', 'BLOQUEIA A PUBLICAÇÃO: sem ele, os botões abrem o WhatsApp pedindo para escolher um contato.');
  if (CONFIG.entregas.length && !CONFIG.autorizacaoClientesConfirmada) add(`Confirmar a autorização dos clientes da galeria (${new Set(CONFIG.entregas.map(e => e.cliente)).size}) para aparecer no site`, 'Cliente sem autorização deve sair da lista de entregas em src/content/site.ts.');
  if (CONFIG.videos.length && !CONFIG.videosConferidos) add('Conferir o áudio dos vídeos e a autorização de quem aparece neles', 'Vídeo sem autorização ou com áudio ruim deve sair da lista de vídeos.');
  if (!CONFIG.logo) add('Logo da FTS em arquivo (SVG ou PNG)', 'O site usa a marca em texto “FTS.”.');
  CONFIG.numeros.filter(n => !n.confirmado).forEach(n => add(`Confirmar número: +${n.valor} ${n.unidade} ${n.rotulo}`, 'Na publicação, os números não confirmados somem.'));
  (Object.keys(CONFIG.servicos) as (keyof typeof CONFIG.servicos)[]).forEach(k => {
    if (CONFIG.servicos[k] === null) add(`Confirmar serviço: ${({ avaliacaoUsado: 'avaliação do usado na troca', frotas: 'venda para empresas e frotas', financiamento: 'financiamento' })[k]}`, 'Na publicação, o que não for confirmado some do site.');
  });
  if (!CONFIG.depoimentos.length) add('3–5 depoimentos reais com nome e autorização', 'A seção de depoimentos escritos não aparece.');
  if (!CONFIG.frase) add('A frase de efeito do Fabricio', 'O espaço da frase em “Quem sou” some na publicação.');
  if (!CONFIG.bio) add('2–3 frases do Fabricio sobre a própria história', '“Quem sou” fica só com os fatos.');
  if (!CONFIG.dominio) add('Domínio do site (campo dominio em src/content/site.ts)', 'Compartilhamento e Google usam endereço provisório.');
  CONFIG.perguntasAbertas.forEach(q => add(q.item, q.impacto));
  return p;
}

/** Texto da resposta sobre marcas (FAQ). */
export const respostaMarcas = () => `Atendo 14 marcas: ${CONFIG.marcas.slice(0, -1).join(', ')} e ${CONFIG.marcas.at(-1)}.`;
