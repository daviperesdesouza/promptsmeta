// Tratamento de cor único + recortes desktop/mobile em WebP para o site da FTS.
//
// Uso (uma vez):   cd tools && npm i sharp
// Depois:          node tools/tratar-fotos.mjs <pasta-com-as-fotos-originais>
//
// Nomeie os originais assim (qualquer extensão .jpg/.jpeg/.png/.heic convertida):
//   hero.jpg      → foto principal do Fabricio (meio corpo, ao lado de um carro)
//   retrato.jpg   → rosto do Fabricio (vira o círculo da assinatura 14 → 1)
//   acao.jpg      → Fabricio com cliente ou entregando a chave
//   entrega-01.jpg ... entrega-15.jpg → entregas reais, com autorização
//
// Saída em assets/fotos/. Depois, preencha CONFIG.fotos no index.html com os caminhos
// impressos no final. O recorte usa "attention" (acha o rosto/área de interesse);
// se algum recorte cortar mal, ajuste a foto original antes de rodar de novo.
import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';

const origem = process.argv[2];
if (!origem) { console.error('Informe a pasta com as fotos originais.'); process.exit(1); }
const destino = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../assets/fotos');
await mkdir(destino, { recursive: true });

// Tratamento único: leve queda de saturação, contraste suave e tom levemente quente,
// para todas as fotos (celulares diferentes, luzes diferentes) parecerem da mesma série.
const tratar = img => img
  .rotate() // respeita a orientação do celular
  .modulate({ saturation: 0.9, brightness: 1.02 })
  .linear(1.06, -6)                 // contraste suave
  .recomb([[1.02, 0.02, 0], [0, 1, 0], [0, 0.02, 0.96]]) // leve aquecimento
  .sharpen({ sigma: 0.6 });

const recortes = {
  hero:    [['desktop', 1200, 1500], ['mobile', 780, 640]],
  retrato: [['', 480, 480]],
  acao:    [['desktop', 1200, 1600], ['mobile', 780, 975]],
  entrega: [['', 960, 1200]],
};

const saida = [];
for (const arq of (await readdir(origem)).sort()) {
  const base = path.parse(arq).name.toLowerCase();
  const tipo = base.startsWith('entrega') ? 'entrega' : base;
  if (!recortes[tipo]) { console.warn('Ignorado (nome não reconhecido):', arq); continue; }
  for (const [sufixo, w, h] of recortes[tipo]) {
    const nome = `${base}${sufixo ? '-' + sufixo : ''}.webp`;
    await tratar(sharp(path.join(origem, arq)))
      .resize(w, h, { fit: 'cover', position: sharp.strategy.attention })
      .webp({ quality: 78, effort: 5 })
      .toFile(path.join(destino, nome));
    saida.push(`assets/fotos/${nome}  (${w}×${h})`);
  }
}
console.log('Gerado:\n' + saida.join('\n'));
