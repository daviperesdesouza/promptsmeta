// Adiciona entregas novas ao site a partir das pastas de fotos do Fabricio.
//
// Uso:   npm run fotos -- "caminho/da/pasta"
//
// A pasta pode ser de UM cliente ou conter várias pastas de clientes. Cada pasta de
// cliente deve se chamar "NOME - CIDADE - MODELO", por exemplo:
//   "Kelly - Aracruz - T-Cross Sense"
//
// O que acontece:
//   1. As fotos (.jpg, .jpeg, .png, .webp) recebem o mesmo tratamento de cor das outras,
//      para a galeria parecer uma série só. Fotos em pé viram 4:5; deitadas viram 4:3.
//      O recorte procura sozinho a área com pessoas.
//   2. As fotos tratadas vão para src/assets/fotos/ como entrega-nome-1.jpg, -2.jpg...
//   3. O script imprime o trecho para colar na lista "entregas" de src/content/site.ts.
//      Confira os campos marcados com CONFIRA antes de publicar.
//
// Opção: --max N   quantas fotos usar por cliente (padrão 3; as maiores, que costumam
//                  ser as mais nítidas). Use --max 0 para todas.
import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const iMax = args.indexOf('--max');
const MAX = iMax >= 0 ? Number(args.splice(iMax, 2)[1]) : 3;
const origem = args[0];
if (!origem || !existsSync(origem)) {
  console.error('Informe a pasta das fotos. Exemplo: npm run fotos -- "Fotos/Kelly - Aracruz - T-Cross Sense"');
  process.exit(1);
}
const DESTINO = path.resolve('src/assets/fotos');
await mkdir(DESTINO, { recursive: true });

// Mesmo tratamento das fotos atuais: fotos de WhatsApp de celulares diferentes ficam parecidas.
const trata = img => img
  .modulate({ saturation: 0.92, brightness: 1.02 })
  .linear(1.05, -5)
  .recomb([[1.015, 0.015, 0], [0, 1, 0], [0, 0.015, 0.97]])
  .sharpen({ sigma: 0.5 });

// Palpite de marca e tipo pelo modelo. É só um palpite: o trecho sai marcado com CONFIRA.
const MODELOS = [
  [/t-?cross|nivus|taos|tiguan/i, 'Volkswagen', 'SUV'], [/polo|gol\b|up!?/i, 'Volkswagen', 'Hatch'], [/virtus|jetta/i, 'Volkswagen', 'Sedã'], [/saveiro|amarok/i, 'Volkswagen', 'Picape'],
  [/strada|toro/i, 'Fiat', 'Picape'], [/argo|mobi/i, 'Fiat', 'Hatch'], [/pulse|fastback/i, 'Fiat', 'SUV'], [/cronos/i, 'Fiat', 'Sedã'],
  [/s-?10|montana/i, 'Chevrolet', 'Picape'], [/tracker|equinox|trailblazer|spin/i, 'Chevrolet', 'SUV'], [/onix plus/i, 'Chevrolet', 'Sedã'], [/onix/i, 'Chevrolet', 'Hatch'],
  [/hilux/i, 'Toyota', 'Picape'], [/corolla cross|yaris cross|sw4|rav4/i, 'Toyota', 'SUV'], [/corolla|yaris sed/i, 'Toyota', 'Sedã'], [/yaris/i, 'Toyota', 'Hatch'],
  [/compass|renegade|commander/i, 'Jeep', 'SUV'], [/ranger|maverick/i, 'Ford', 'Picape'], [/territory|bronco/i, 'Ford', 'SUV'],
  [/oroch/i, 'Renault', 'Picape'], [/duster|kardian|boreal/i, 'Renault', 'SUV'], [/kwid/i, 'Renault', 'Hatch'],
  [/hr-?v|wr-?v|zr-?v/i, 'Honda', 'SUV'], [/city|civic/i, 'Honda', 'Sedã'], [/creta|tucson/i, 'Hyundai', 'SUV'], [/hb20s/i, 'Hyundai', 'Sedã'], [/hb20/i, 'Hyundai', 'Hatch'],
  [/rampage|\b(1500|2500|3500)\b/i, 'RAM', 'Picape'], [/2008|3008|5008/i, 'Peugeot', 'SUV'], [/208/i, 'Peugeot', 'Hatch'],
  [/aircross|basalt|c4 cactus/i, 'Citroën', 'SUV'], [/c3/i, 'Citroën', 'Hatch'], [/haval|h6|tank/i, 'GWM', 'SUV'], [/poer/i, 'GWM', 'Picape'], [/ora/i, 'GWM', 'Hatch'],
  [/omoda/i, 'Omoda', 'SUV'], [/jaecoo/i, 'Jaecoo', 'SUV'],
];
const HIBRIDO = /hybrid|h[ií]brid|shev|phev|hev\b|\bev\b|el[eé]tric/i;

const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const titulo = s => s.trim().toLowerCase().replace(/(^|\s|-)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
// Só o primeiro nome (ou os dois primeiros em nomes compostos comuns), como no resto do site.
const COMPOSTOS = ['jose', 'josé', 'maria', 'joao', 'joão', 'ana'];
const primeiroNome = s => { const p = titulo(s).split(/\s+/); return p.slice(0, COMPOSTOS.includes(p[0].toLowerCase()) && p[1] ? 2 : 1).join(' '); };
const cidadeDe = s => titulo(s.replace(/\s*[-–]\s*ES$/i, ''));
// Siglas e versões ficam em maiúsculas (S10, LTZ, XRX); o resto vira "Título".
const modeloDe = s => s.trim().split(/\s+/).map(w => (/\d/.test(w) || w.replace(/[^\p{L}]/gu, '').length <= 3) ? w.toUpperCase() : titulo(w)).join(' ');
const ehFoto = f => /\.(jpe?g|png|webp)$/i.test(f);

async function pastasDeCliente(dir) {
  const itens = await readdir(dir, { withFileTypes: true });
  if (itens.some(i => i.isFile() && ehFoto(i.name))) return [dir];
  return itens.filter(i => i.isDirectory()).map(i => path.join(dir, i.name)).sort();
}

const trechos = [];
for (const pasta of await pastasDeCliente(origem)) {
  const partes = path.basename(pasta).split(/\s+-\s+/);
  const nome = primeiroNome(partes[0] || ''), cidade = partes[1] ? cidadeDe(partes[1]) : '', modelo = partes[2] ? modeloDe(partes.slice(2).join(' - ')) : '';
  if (!nome) continue;
  const arquivos = (await readdir(pasta)).filter(ehFoto);
  if (!arquivos.length) { console.warn(`Sem fotos em: ${pasta}`); continue; }
  const comTamanho = await Promise.all(arquivos.map(async f => ({ f, t: (await stat(path.join(pasta, f))).size })));
  const escolhidas = comTamanho.sort((a, b) => b.t - a.t).slice(0, MAX > 0 ? MAX : undefined).map(x => x.f).sort();

  const base = `entrega-${slug(nome)}`;
  let n = 1;
  while (existsSync(path.join(DESTINO, `${base}-${n}.jpg`))) n++;
  const palpite = MODELOS.find(([re]) => re.test(modelo)) || [null, '', ''];
  const hibrido = HIBRIDO.test(modelo);

  for (const f of escolhidas) {
    const buf = await sharp(path.join(pasta, f), { failOn: 'none' }).rotate().toBuffer();
    const { width: w, height: h } = await sharp(buf).metadata();
    const emPe = h > w;
    // Em pé: 4:5. Deitada: 4:3. Tamanho máximo de 1600 px no lado maior (o site gera os menores).
    const [lw, lh] = emPe ? [Math.min(w, 1280), Math.round(Math.min(w, 1280) * 1.25)] : [Math.min(w, 1600), Math.round(Math.min(w, 1600) * 0.75)];
    const nomeArq = `${base}-${n++}`;
    await trata(sharp(buf).resize(lw, lh, { fit: 'cover', position: sharp.strategy.attention, withoutEnlargement: true }))
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(path.join(DESTINO, nomeArq + '.jpg'));
    console.log(`✔ ${path.join(path.basename(pasta), f)} → src/assets/fotos/${nomeArq}.jpg`);
    const alt = `${modelo || 'Carro 0 km'} entregue${nome ? ` para ${nome}` : ''}${cidade ? `, em ${cidade}` : ''}`;
    trechos.push(
      `  { foto: '${nomeArq}', formato: '${emPe ? 'v' : 'h'}', marca: '${palpite[1] || '[PENDENTE]'}', tipo: '${palpite[2] || 'SUV'}'${hibrido ? ', hibrido: true' : ''}, ` +
      `cliente: '${nome}', cidade: '${cidade || '[PENDENTE]'}', carro: '${modelo || '[PENDENTE]'}', alt: '${alt.replace(/'/g, '’')}' }, // CONFIRA marca, tipo e texto`,
    );
  }
}

if (!trechos.length) { console.error('Nenhuma foto encontrada.'); process.exit(1); }
console.log(`
Cole estas linhas na lista "entregas" de src/content/site.ts (na ordem em que devem aparecer).
Tipos aceitos: 'SUV', 'Picape', 'Hatch', 'Sedã', 'Elétrico'. Deixe só as melhores fotos de cada cliente.
Antes de publicar: confirme que o cliente autorizou aparecer no site.

${trechos.join('\n')}
`);
