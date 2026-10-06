# FTS Multimarcas 0km: site

Site estático de uma página para Fabricio Teixeira, consultor de carros 0 km de 14 marcas em Aracruz-ES.
Objetivo único: levar o visitante ao WhatsApp do Fabricio em até 2 toques, com a mensagem já escrita.

```
fts-multimarcas/
├── index.html               ← o site inteiro (HTML + CSS + JS, autossuficiente)
├── assets/
│   ├── og-capa.jpg          ← imagem de compartilhamento 1200×630
│   └── fotos/               ← fotos tratadas (geradas pelo script abaixo)
├── tools/tratar-fotos.mjs   ← aplica o tratamento de cor e gera os recortes WebP
└── docs/screenshots/        ← QA final em 360, 390, 768, 1280 e 1440 px
```

## Como editar

Tudo o que muda fica no objeto `CONFIG`, no topo do `<script>` do `index.html`. Cada campo tem um comentário explicando o que é.

- `modoRevisao: true` é a versão de revisão: as pendências aparecem em amarelo e a lista completa fica no rodapé.
- `modoRevisao: false` é a versão para publicar: esconde as pendências e **remove** tudo o que não foi confirmado (serviços `null`, números `confirmado:false`, galeria sem fotos).
- Fotos: coloque os originais numa pasta e rode `cd tools && npm i sharp && cd .. && node tools/tratar-fotos.mjs <pasta>`. Depois copie os caminhos para `CONFIG.fotos`.
- Domínio: troque `SEU-DOMINIO.com.br` no `<head>` (canonical, Open Graph e schema.org).

Para ver localmente, basta abrir o `index.html` no navegador (ou usar `npx serve .`).

---

## 1. Posicionamento

**O que a FTS vende de fato:** tempo poupado (uma conversa em vez de 14 concessionárias), a melhor condição achada entre várias marcas e uma pessoa de confiança do primeiro "oi" até a chave na mão.
**Para quem:** famílias de Aracruz, Piúma, Fundão, João Neiva, Ibiraçu, Vitória e entorno comprando o próximo carro, e empresas renovando a frota (a confirmar).
**Frase-guia:** "14 marcas. Um consultor."

## 2. Três conceitos

| | A · Rota Única (escolhido) | B · Mesa do Consultor | C · Noite de Entrega |
|---|---|---|---|
| Ideia central | Um mapa editorial: 14 caminhos que viram 1. O site é o atalho. | A escrivaninha do Fabricio: papéis, chave, propostas lado a lado, como um "dossiê" de cada marca. | O momento da entrega, com fotos escuras e dramáticas e a luz no carro novo. |
| Fotografia | Real e calorosa, sempre com o Fabricio; recortes grandes com cantos arredondados. | Still-life de mesa + retratos. | Fotos noturnas de entrega em tela cheia. |
| Cores | Papel #F5F4EF como base, preto #101010 no texto e nas faixas de ritmo, **verde #048437 só para ação e para a rota**. | Branco com verde em etiquetas e carimbos. | Preto dominante, verde como luz. |
| Fontes | Bricolage Grotesque (títulos) + Inter (texto). | Fraunces + Inter. | Archivo Expanded + Inter. |
| Assinatura de movimento | Linhas desenhadas pela rolagem que convergem num único ponto. | Cartões que se empilham e viram uma proposta. | Faróis acendendo por seção. |

**Por que a A:** é a única em que o diferencial ("14 → 1") vira a própria linguagem visual, sem depender de fotos que ainda não existem. Ela foge do visual preto + vermelho de concessionária usando papel claro e tipografia editorial. O verde fica reservado ao que leva ao WhatsApp. O conceito C dependeria de uma produção de fotos noturnas que não existe, e o B se parece com um site de corretora.

## 3. Assinatura única: "14 → 1"

Uma seção fixa na tela enquanto a rolagem avança (cerca de 3 alturas de tela):
1. As 14 marcas entram, uma a uma. Texto: "14 marcas. Um consultor."
2. De cada marca sai uma linha verde que corre (com um ponto viajando) até um único ponto. Texto: "Eu faço esse caminho por você."
3. O ponto cresce e vira o **rosto do Fabricio** (hoje mostra "1" até a foto chegar), com o botão "Falar com o Fabricio" logo abaixo. Texto: "Tudo cabe em uma conversa."

No celular a composição é própria: duas colunas de marcas soltam as linhas por dentro, as 14 descem juntas por um feixe central e chegam ao círculo e ao botão.
Com `prefers-reduced-motion` ela aparece estática e completa. Sem JavaScript, vira uma lista de marcas seguida do botão.
Teste de exclusividade: a seção só faz sentido para quem é um consultor de 14 marcas. Com outra revenda, a ideia não se sustenta.

## 4. Roteiro das seções

| # | Seção | Objetivo | Elemento dominante | Texto × imagem | Transição | CTA |
|---|---|---|---|---|---|---|
| 1 | Hero | Benefício em 5 s | Título "Seu próximo carro, sem rodar concessionária." | Texto à esquerda, foto 4:5 do Fabricio à direita (no celular a foto vem em faixa acima) | Máscara linha a linha + foto por clip-path | "Quero encontrar meu próximo carro" / "Quero saber as condições" |
| 2 | Números | Prova | "+1.200" gigante | Só tipografia, faixa preta (primeira quebra de ritmo) | Contadores | — |
| 3 | O que você procura? | Qualificar em 1 toque | 6 cartões tipográficos alternados em altura (lista deslizável no celular) | Sem imagem de propósito: sem carro de banco | Preenchimento verde a partir do canto | Cada cartão abre o WhatsApp com a categoria |
| 4 | 14 → 1 | Diferencial memorável | Linhas convergindo | Texto troca em 3 fases | Rolagem conduz tudo | "Falar com o Fabricio" |
| 5 | Como funciona | Tirar o medo do processo | Linha única com 4 nós (continuação da rota) | Texto puro | Linha se desenha | — |
| 6 | Entregas | Prova humana | Galeria deslizável com alturas alternadas; tela cheia ao tocar | Foto dominante, legenda discreta | Clip-path de baixo para cima | — |
| 7 | Quem é o Fabricio | Confiança pessoal | Foto em ação + "Prazer, Fabricio Teixeira." | Grade 5/7 assimétrica | Fade-up | "Falar com o Fabricio" + Instagram |
| 8 | Marcas + região | Relevância local | Cidades em tipografia enorme, Aracruz em verde | Lista das 14 marcas ao lado | Fade-up | — |
| 9 | Empresas | Frotas | Faixa verde inteira (quebra de ritmo) | Título + texto curto | Fade-up | "Falar sobre minha frota" |
| 10 | Dúvidas | Tirar objeções | Acordeão | Só respostas verdadeiras | Ícone + vira − | "Como eu começo?" aponta para os botões |
| 11 | CTA final | Converter | "Me conta o que você procura." | Seletor de categoria + 4 intenções | Fundo verde sobe em cada linha | As 4 intenções |
| 12 | Rodapé | Dados legais | CNPJ, endereço, contato | — | — | WhatsApp |

## 5. CTAs por intenção (mensagens prontas)

Todo botão monta `https://wa.me/<número>?text=<mensagem>`. A categoria escolhida (num cartão ou nos chips do CTA final) entra em todas as mensagens seguintes.

- Encontrar: "Olá, Fabricio! Vim pelo site e quero encontrar meu próximo carro. Estou procurando um SUV."
- Condições: "Olá, Fabricio! Vim pelo site e quero saber as condições para uma picape."
- Usado: "Olá, Fabricio! Vim pelo site e quero avaliar meu usado na troca por um sedã. Meu carro atual é: "
- Frota: "Olá, Fabricio! Vim pelo site e quero falar sobre a frota da minha empresa."

Testado em Playwright: 20 links, todas as mensagens corretas, e a categoria se propaga ao escolher "Picape".

## 6. Sistema visual

- **Cores:** verde #048437 (ação), verde escuro #036D2E (hover e texto verde pequeno), verde #3FB26A (verde sobre preto), papel #F5F4EF, papel-2 #ECEAE3, linha #D9D6CC, tinta-2 #55534D, preto #101010, cinza-noite #A9A8A2 e branco.
- **Contraste medido (WCAG):** branco/verde 4,82 · tinta-2/papel 6,98 · verde escuro/papel 5,90 · cinza-noite/preto 7,98 · verde claro/preto 7,06. O verde #048437 sobre o papel dá 4,37 e só é usado em títulos grandes (AA para texto grande).
- **Tipografia fluida:** hero `clamp(2.55rem, 1.05rem + 5.1vw, 6rem)`, h2 `clamp(2.1rem, …, 4.5rem)`, h3, lead, corpo 17px e rótulos de 12px em caixa-alta espaçada.
- **Grade:** 12 colunas, gutter `clamp(16px, 4vw, 56px)`, largura máxima de 1360px. Seções com `clamp(80px, 11vw, 168px)`.
- **Botões:** pílula de 56px (44px no cabeçalho). Hover: fundo mais escuro sobe e a seta anda. Active: escala 0,97. Foco: contorno de 3px. Toques ≥ 44px (medido).

## 7. Mapa de motion

| Elemento | Gatilho | Comportamento | Duração | Easing | Mobile | Reduced-motion |
|---|---|---|---|---|---|---|
| Cabeçalho | Carregar | Fade + desce 10px | 450 ms | out (.2,.8,.2,1) | Igual | Aparece direto |
| Título H1 | Carregar | Palavras sobem de dentro de máscara, atraso por linha (90 ms) | 720 ms, termina ~1,07 s | out | Igual | Estático |
| Foto do hero | Carregar | Clip-path de baixo para cima + escala 1,12 → 1 | 950–1050 ms | in-out (.65,0,.35,1) | Escala 1,06 | Estática |
| Subtítulo/CTA | Carregar | Fade + sobe 14px, atraso de 0,5 a 0,7 s | 550–650 ms | out | Igual | Estático |
| Contadores | 60% visível | 0 → número oficial (só +1.200, 14 e os confirmados) | 900 ms / 1400 ms | cubic out | Igual | Número final |
| Assinatura 14 → 1 | Rolagem (fixa) | Marcas entram, linhas se desenham com ponto viajando, círculo cresce, botão surge, texto em 3 fases | Proporcional à rolagem (~3 telas) | Linear na rolagem, cúbico no círculo | Layout próprio com feixe central | Estática e completa |
| Seções (rv) | 12% da tela | Fade + sobe 22px, escalonado | 700–800 ms | out | Sobe 14px | Sem animação |
| Galeria | Entrar na tela | Clip-path de baixo para cima, escalonado 80 ms | 950 ms | in-out | Deslize nativo com snap | Sem animação |
| Linha do "Como funciona" | Entrar na tela | Linha se desenha (horizontal no desktop, vertical no celular) | 1400 ms | in-out | Vertical | Completa |
| Cartões de categoria | Hover/foco | Círculo verde cresce do canto, seta gira −45° | 600 ms | in-out | Toque: escala 0,98 | Instantâneo |
| Menu (mobile) | Toque | Círculo preto se abre a partir do botão, links sobem escalonados, ☰ vira ✕ | 700 ms | in-out | Só no mobile | Instantâneo |
| WhatsApp fixo | Sair do hero | Sobe com mola; some quando outro botão entra na área dele | 500 ms | mola (.34,1.4,.64,1) | Círculo de 60px | Instantâneo |
| Lightbox | Toque na foto | Fade; deslize com snap, setas, teclado ← → e Esc | 350 ms | out | Tela cheia | Instantâneo |

## 8. Implementação: notas técnicas

- Um único `index.html`, sem backend e sem bibliotecas. Fontes do Google com `display=swap`, e a abertura não espera a fonte carregar (não há tela de carregamento).
- Conteúdo legível sem JS: todo o texto está no HTML. Sem JS, as animações ficam desligadas e os links apontam para o WhatsApp com a mensagem pronta.
- Um único `h1`, link "Pular para o conteúdo", foco visível, menu com foco preso e Esc, lightbox com `<dialog>` (o foco volta à foto ao fechar), acordeão nativo `<details>`.
- SEO local: title e description com "carro 0 km em Aracruz", JSON-LD `AutoDealer` + `Person` (razão social, CNPJ, endereço do CNPJ, cidades atendidas, Instagram) e Open Graph com `og-capa.jpg` 1200×630.
- Imagens: `<picture>` com recorte mobile, `width`/`height` definidos, `loading="lazy"` fora da primeira dobra e `fetchpriority="high"` na foto do hero.

## 9. QA visual (feito)

Screenshots em `docs/screenshots/` (hero, assinatura e página inteira em cada largura). Rodadas de correção:
1. Rolagem horizontal em 768 e 1280 px (foto do hero esticando a grade) → corrigido; zero em todas as larguras.
2. H1 encostando na foto no desktop → escala reduzida.
3. "Empresas" estourando o cartão no desktop → tamanho próprio para 6 colunas.
4. Assinatura desalinhada da grade em 1440 px e linhas atravessando os nomes no celular → palco alinhado ao `.wrap` e rota mobile redesenhada com feixe central.
5. Menu mobile: cabeçalho claro cobria o primeiro link → cabeçalho transparente com o menu aberto.
6. Tablet: "concessionária." invadia a foto → hero empilhado até 1024 px.
7. Verde pequeno sobre o papel abaixo de AA → verde escuro derivado.

Verificado sem erros de console, JSON-LD válido, 20 links de WhatsApp com a mensagem correta, menu, lightbox, teclado e a versão de publicação (`modoRevisao:false`: zero marcadores visíveis, seção Empresas removida, 2 intenções e 2 números não confirmados removidos).

## 10. Notas pelos critérios (versão atual, **sem as fotos**)

| Critério | Nota | Justificativa |
|---|---|---|
| 1. Benefício em 5 s | 9 | O título abre pelo benefício, "14 marcas" vem como prova e o CTA fica visível sem rolar em 390×844. |
| 2. Presença humana real | 9 | O Fabricio aparece no topo, no fim da assinatura 14 → 1, em "Quem é" e em 7 das 13 fotos de entregas reais.
| 3. Assinatura 14 → 1 | 9 | Conduzida pela rolagem, com composição própria no celular e terminando no botão. Sem os nomes das marcas, perde força. |
| 4. WhatsApp em ≤ 2 toques | 10 | 1 toque, 20 botões, número real e mensagem pronta por intenção e categoria. |
| 5. Ritmo e composição | 9 | Alterna papel, preto e verde, com cartões desnivelados, galeria alternada e grades assimétricas. Nenhum "título + 3 cards". |
| 6. Mobile próprio | 9 | Hero empilhado, lista deslizável, feixe central na assinatura, menu circular, galeria em tela cheia e botão fixo inteligente. |
| 7. Motion | 9 | Abertura em ~1,1 s, cada movimento com função e versão reduced-motion completa. |
| 8. Acabamento | 8 | Estados de hover, foco e toque em tudo e rodapé com dados legais. Falta o logo real. |
| 9. Performance e acessibilidade | 9 | Sem bibliotecas, contraste AA medido, teclado, um h1 e conteúdo legível sem JS. |
| 10. Veracidade | 10 | Nenhum número, depoimento, preço, parceiro ou serviço inventado. O não confirmado aparece marcado ou some na publicação. |

**Pronto para publicar** depois de confirmar a autorização dos clientes e trocar `modoRevisao` para `false`.

## 11. Pendências (o que falta e o impacto)

Já no site: WhatsApp (27) 99849-0805, e-mail, Instagram @fabricioteixeiradesouza, +20 anos, as 14 marcas com logos (cinza, com aviso de consultor independente), "vou até você", parceria com as marcas, entrega na concessionária, usado na troca, financiamento, empresas/frotas e públicos (pessoa física, empresa, produtor rural, taxista, autoescola, locadora e PCD, tirados das artes de divulgação dele). Logos nas cores oficiais. Galeria com filtro por tipo (SUV, Picape, Hatch, Híbrido) e 4 vídeos de entrega (MP4 + WebM, carregam só no play). Fotos reais: topo, retrato da assinatura, "Quem é" e 13 fotos de 8 entregas (Kelly, Jair, Zélia, Sérgio, José Manoel, Josenilton, Fernando e Joacir).

| # | Falta | Impacto |
|---|---|---|
| 1 | Confirmar a autorização dos 8 clientes da galeria | Quem não autorizar sai de `CONFIG.fotos.entregas`. |
| 2 | Omoda e Jaecoo contam como uma marca? (o adesivo tem 15 logos) | Se forem 15, "14 marcas" muda no site todo. |
| 3 | A arte de divulgação cita Nissan, que não está no adesivo | Se ele vende Nissan, a lista e o número mudam. |
| 4 | Há quantos anos o cliente mais antigo compra com ele? | Some da publicação até confirmar. |
| 5 | 3–5 depoimentos com nome e autorização | A seção não aparece. |
| 6 | 2–3 frases do Fabricio sobre a história dele | "Quem é" fica só com os fatos. |
| 7 | Logo da FTS em arquivo | Usa a marca em texto "FTS.". |
| 8 | Domínio | Canonical, Open Graph e schema usam `SEU-DOMINIO.com.br`. |
| 9 | Conferir o áudio dos 4 vídeos e a autorização de quem aparece | Os vídeos estão na seção "Na hora da entrega"; o áudio não foi revisado (só a imagem). |

Fatos usados do registro público: razão social, nome fantasia, CNPJ, abertura em 2018, endereço. O site não usa capital social, a data de entrada do sócio nem as atividades do CNPJ.
