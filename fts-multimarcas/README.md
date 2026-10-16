# FTS Multimarcas 0km: site

Site de uma página para Fabricio Teixeira, consultor de carros 0 km de 14 marcas em Aracruz-ES.
Objetivo único: levar o visitante ao WhatsApp do Fabricio em até 2 toques, com a mensagem já escrita.

Esta é a **versão 2** (redesign). O relatório completo (diagnóstico, direção de arte, decisões, métricas antes × depois e checklist de paridade) está em [`docs/redesign/README.md`](docs/redesign/README.md). A versão 1 (um `index.html` único) continua no histórico do Git, no commit `ab70ee6`.

```
fts-multimarcas/
├── src/
│   ├── content/site.ts        ← TODO o conteúdo editável (textos, números, fotos, vídeos, FAQ)
│   ├── assets/fotos/          ← fotos-mestre tratadas (o site gera os tamanhos sozinho)
│   ├── assets/marcas/         ← logos coloridos das 14 marcas
│   ├── components/            ← uma seção por arquivo (Hero, Numeros, Assinatura…)
│   ├── components/Galeria.tsx ← galeria de entregas (React): filtro, carrossel e tela cheia
│   ├── scripts/               ← comportamentos (rolagem, assinatura 14 → 1, menu, WhatsApp)
│   ├── lib/whatsapp.ts        ← as mensagens prontas de cada botão
│   └── styles/global.css      ← cores, tipografia, espaçamentos e movimento
├── public/                    ← arquivos copiados como estão (vídeos, og-capa.jpg, favicon)
├── tools/                     ← scripts: adicionar entregas e gerar a imagem de compartilhamento
├── tests/qa.mjs               ← testes automáticos do site pronto
└── docs/                      ← prints de QA e o relatório do redesign
```

## Como rodar

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
cd fts-multimarcas
npm install
npm run dev       # abre em http://localhost:4321 e atualiza sozinho ao salvar
npm run build     # gera o site pronto na pasta dist/
npm run preview   # mostra o dist/ como ficará publicado
```

## Como editar o conteúdo

Tudo o que muda fica em **`src/content/site.ts`**. Cada campo tem um comentário. Os principais:

- `modoRevisao: true` é a versão de revisão: as pendências aparecem em amarelo e a lista completa fica no rodapé. Com `false` (versão para publicar), as marcações somem e **sai do site** tudo o que não foi confirmado (serviços `null`, números com `confirmado: false`).
- `whatsapp`, `email`, `instagram`, `cidades`, `empresa`: contato e dados legais.
- `numeros`: só entram números reais. Um número com `confirmado: false` aparece marcado na revisão e some na publicação.
- `servicos` e `respostas`: o que ele confirmou que faz (usado na troca, frotas, financiamento) e o texto das respostas.
- `frase` e `bio`: deixe vazio até ter as palavras do Fabricio. Vazio = some na publicação.
- `entregas` e `videos`: a galeria e os vídeos (veja abaixo).
- `dominio`: quando houver, preencha (`https://…`). Ele entra no Google e no compartilhamento.
- `TEXTOS`: título do Google, textos do topo, passos do "Como funciona" e perguntas frequentes.

Depois de editar, rode `npm run build` (ou deixe o `npm run dev` aberto para ver na hora).

## Como adicionar um cliente novo na galeria

1. Separe as fotos de cada cliente numa pasta chamada **`NOME - CIDADE - MODELO`**, por exemplo `Kelly - Aracruz - T-Cross Sense` (pode ser o padrão das pastas que ele já usa, como `KELLY FRAGA LOYOLA - ARACRUZ - T-CROSS SENSE`).
2. Rode, apontando para a pasta do cliente (ou para uma pasta com várias pastas de clientes):
   ```bash
   npm run fotos -- "caminho/Kelly - Aracruz - T-Cross Sense"
   ```
   O script trata as cores (para combinar com as outras fotos), recorta em 4:5 (em pé) ou 4:3 (deitada) procurando as pessoas, salva em `src/assets/fotos/` e **imprime as linhas prontas** para colar na lista `entregas` de `src/content/site.ts`. Por padrão usa as 3 maiores fotos de cada cliente (`--max 5` para usar 5, `--max 0` para todas).
3. Cole as linhas, confira marca, tipo (`'SUV'`, `'Picape'`, `'Hatch'`, `'Sedã'` ou `'Elétrico'`) e o texto marcados com `CONFIRA`, e apague as fotos de que não gostar.
4. **Só publique com a autorização do cliente.** Quando todas estiverem autorizadas, troque `autorizacaoClientesConfirmada` para `true`.

O filtro, a contagem de cada tipo e a tela cheia se ajustam sozinhos. Para destacar um tipo nos cartões de "O que você procura?", troque a foto em `fotoPorTipo`.

### Trocar as fotos fixas

As fotos do topo (`hero-desktop.jpg`, em pé, e `hero-mobile.jpg`, deitada), o retrato da assinatura (`retrato.jpg`, quadrado) e a foto de "Quem sou" (`acao.jpg`) ficam em `src/assets/fotos/`. Basta substituir o arquivo mantendo o nome; o site gera todos os tamanhos no build.

### Vídeos

Cada vídeo precisa de três arquivos em `public/videos/` com o mesmo nome: `.mp4` (iPhone e a maioria), `.webm` (alguns Androids) e `.webp` (a capa). Depois, acrescente uma linha em `videos` no `site.ts`. Com o [ffmpeg](https://ffmpeg.org):

```bash
ffmpeg -i original.mov -vf "scale='min(720,iw)':-2" -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 96k -movflags +faststart nome.mp4
ffmpeg -i original.mov -vf "scale='min(720,iw)':-2" -c:v libvpx-vp9 -crf 36 -b:v 0 -c:a libopus nome.webm
ffmpeg -ss 1 -i nome.mp4 -frames:v 1 -vf "scale='min(720,iw)':-2" nome.webp
```

Os vídeos só baixam quando a pessoa aperta o play. Antes de publicar, ouça o áudio e confirme a autorização de quem aparece.

### Imagem de compartilhamento

`npm run og` gera `public/og-capa.jpg` (1200×630, a prévia que aparece no WhatsApp e no Facebook) com a foto do topo e o título atual.

## Como publicar

O site pronto é a pasta `dist/` (só arquivos estáticos). Opções gratuitas e simples:

- **Netlify** ou **Vercel**: conecte o repositório e use *Build command* `npm run build` e *Output/Publish directory* `fts-multimarcas/dist` (com *Base directory* `fts-multimarcas`). Os arquivos `public/_headers` (Netlify) e `vercel.json` (Vercel) já deixam as fotos e scripts no cache do navegador por 1 ano.
- **Qualquer hospedagem**: rode `npm run build` e envie o conteúdo de `dist/` para a pasta pública.

Antes de publicar: `modoRevisao: false`, autorizações confirmadas e `dominio` preenchido.

> Se o site for publicado numa **subpasta** (por exemplo `usuario.github.io/fts/`), acrescente `base: '/fts/'` em `astro.config.mjs`. Na raiz de um domínio próprio não é preciso.

## Testes

```bash
npm run build && npm run qa
```

Abre o site pronto num Chromium e confere 67 pontos: os 20 links de WhatsApp e cada mensagem, a categoria escolhida entrando nas mensagens, filtros e contagens da galeria, tela cheia, vídeo, menu do celular, botão fixo, assinatura sem sobreposição em 4 tamanhos de tela, hodômetro parando nos números reais, versão sem JavaScript, "reduzir movimento", rolagem lateral em 5 larguras e acessibilidade (axe). Precisa do Chromium do Playwright: `npx playwright install chromium` (ou a variável `CHROMIUM_PATH`).
