/* =====================================================================
   CONTEÚDO DO SITE — edite SÓ este arquivo para atualizar o site.
   Regra da marca: nada aqui pode ser inventado. Deixe vazio (ou null) o
   que não estiver confirmado; o site esconde ou marca como [PENDENTE].

   Depois de editar: `npm run build` (ou faça commit, se o site estiver
   ligado à Vercel/Netlify, que o build roda sozinho).
   ===================================================================== */

export type Tipo = 'SUV' | 'Picape' | 'Hatch' | 'Sedã' | 'Elétrico';

export interface Entrega {
  /** Nome do arquivo em src/assets/fotos, sem extensão. */
  foto: string;
  /** 'v' = vertical (4:5), 'h' = horizontal (4:3). */
  formato: 'v' | 'h';
  marca: string;
  tipo: Tipo;
  /** Marca o selo "Híbrido". */
  hibrido?: boolean;
  /** Primeiro nome do cliente (aparece na plaquinha). */
  cliente: string;
  cidade: string;
  carro: string;
  /** Descrição da foto para quem usa leitor de tela. */
  alt: string;
}

export interface Video {
  /** Arquivos em public/videos, sem extensão (precisa existir .mp4, .webm e .webp com o mesmo nome). */
  arquivo: string;
  formato: 'v' | 'h';
  duracao: string;
  titulo: string;
  legenda: string;
  carro: string;
}

export const CONFIG = {
  // true  = versão de revisão: mostra marcadores amarelos [PENDENTE] e a lista no rodapé.
  // false = versão para publicar: esconde marcadores e tudo que não foi confirmado.
  modoRevisao: true,

  // Domínio final, sem barra no fim. Ex.: 'https://fabricioteixeira.com.br'. Vazio = provisório.
  dominio: '',

  // WhatsApp do Fabricio: só números, com 55 + DDD.
  whatsapp: '5527998490805',
  whatsappExibicao: '(27) 99849-0805',
  email: 'ftsfabricioteixeira@gmail.com',
  // null = não exibir horário (autônomo, atende praticamente o dia todo). Texto = exibe.
  atendimento: null as string | null,
  // Sem @. Trocar quando o perfil profissional estiver ativo.
  instagram: 'fabricioteixeiradesouza',
  facebook: { nome: 'Fabricio Teixeira', url: '' },
  // Arquivo do logo em src/assets (ex.: 'logo.svg'). Vazio = usa a marca em texto "FTS.".
  logo: '',

  // Números oficiais. Use exatamente como o Fabricio confirmou; nunca arredonde.
  // confirmado:false aparece como PENDENTE na revisão e some na publicação.
  numeros: [
    { valor: 1200, mais: true, unidade: '', rotulo: 'carros entregues', confirmado: true, destaque: true },
    { valor: 14, mais: false, unidade: '', rotulo: 'marcas de 0 km', confirmado: true },
    { valor: 20, mais: true, unidade: 'anos', rotulo: 'de atuação', confirmado: true },
    { valor: 15, mais: true, unidade: 'anos', rotulo: 'de clientes que compram comigo', confirmado: false },
  ],

  // As 14 marcas, na ordem em que aparecem.
  marcas: ['Chevrolet', 'Toyota', 'Jeep', 'Ford', 'Renault', 'Honda', 'Hyundai', 'Volkswagen', 'RAM', 'Peugeot', 'Citroën', 'GWM', 'Omoda | Jaecoo', 'Fiat'],
  // Logos em src/assets/marcas (sem extensão). Vários arquivos = logos lado a lado.
  logos: {
    'Chevrolet': ['chevrolet'], 'Toyota': ['toyota'], 'Jeep': ['jeep'], 'Ford': ['ford'], 'Renault': ['renault'],
    'Honda': ['honda'], 'Hyundai': ['hyundai'], 'Volkswagen': ['volkswagen'], 'RAM': ['ram'], 'Peugeot': ['peugeot'],
    'Citroën': ['citroen'], 'GWM': ['gwm'], 'Omoda | Jaecoo': ['omoda', 'jaecoo'], 'Fiat': ['fiat'],
  } as Record<string, string[]>,

  // Serviços: true = confirmado, false = não oferece (some do site), null = ainda não confirmado.
  servicos: {
    avaliacaoUsado: true as boolean | null, // "Quero avaliar meu usado"
    frotas: true as boolean | null,         // seção Empresas, categoria Empresas e "Falar sobre minha frota"
    financiamento: true as boolean | null,  // pergunta sobre financiamento
  },
  // Respostas reais para as perguntas (só preencha com o que o Fabricio confirmar).
  respostas: {
    avaliacaoUsado: 'Sim, o seu usado pode entrar na negociação. Se eu mesmo não ficar com ele, encontro quem compre.',
    financiamento: 'Sim. Busco taxas competitivas e acompanho a aprovação do financiamento com você.',
  },
  // Texto curto confirmado sobre como ele consegue o carro e as condições.
  comoFunciona: 'Trabalho em parceria com as marcas. Comparo modelos e condições para o seu caso, sem você rodar concessionária.',
  // 2–3 frases do Fabricio, com as palavras dele. Vazio = espaço reservado na revisão; some na publicação.
  bio: '',
  // A frase de efeito dele (curta). Vazio = espaço reservado na revisão; some na publicação.
  frase: '',

  // Quem ele atende (das artes de divulgação do próprio Fabricio).
  publicos: ['Pessoa física', 'Empresa', 'Produtor rural', 'Taxista', 'Autoescola', 'Locadora', 'PCD'],

  // Cidades atendidas. A primeira é a base.
  cidades: ['Aracruz', 'Piúma', 'Fundão', 'João Neiva', 'Ibiraçu', 'Vitória'],

  // Dados legais (registro público).
  empresa: {
    razaoSocial: 'FTS Multimarcas e Serviços Ltda',
    cnpj: '29.464.051/0001-56',
    desde: 2018,
    endereco: 'Rua Elizabeth Pontin, 88, Loja B',
    bairroCidade: 'Vila Rica, Aracruz-ES',
    cep: '29194-124',
  },

  // Fotos fixas (arquivos em src/assets/fotos, sem extensão).
  fotos: {
    hero: { desktop: 'hero-desktop', mobile: 'hero-mobile', alt: 'Fabricio Teixeira sorrindo diante de um SUV branco 0 km com laço vermelho, no dia da entrega' },
    retrato: { src: 'retrato', alt: 'Fabricio Teixeira sorrindo' },
    acao: { src: 'acao', alt: 'Fabricio Teixeira com o casal Joacir e esposa na entrega da Strada, com o carro coberto por um laço vermelho' },
  },

  // Foto de fundo de cada tipo em "O que você procura?" (arquivo em src/assets/fotos).
  // Tipo sem foto real aparece só com tipografia.
  fotoPorTipo: {
    'SUV': 'entrega-kelly-1',
    'Picape': 'entrega-fernando-2',
    'Hatch': 'entrega-josenilton-1',
    'Elétrico': 'entrega-zelia-1',
  } as Record<string, string>,

  // Entregas reais e autorizadas. tipo vira botão de filtro; hibrido marca o selo "Híbrido".
  // Para adicionar clientes novos: npm run fotos -- <pasta>  (veja o README).
  entregas: [
    { foto: 'entrega-kelly-1', formato: 'v', marca: 'Volkswagen', tipo: 'SUV', cliente: 'Kelly', cidade: 'Aracruz', carro: 'VW T-Cross Sense', alt: 'Kelly de braços abertos ao lado do T-Cross branco com laço azul, na concessionária' },
    { foto: 'entrega-jair-1', formato: 'h', marca: 'Volkswagen', tipo: 'Picape', cliente: 'Jair', cidade: 'Aracruz', carro: 'VW Saveiro Extreme', alt: 'Fabricio Teixeira e o cliente Jair ao lado da Saveiro' },
    { foto: 'entrega-zelia-1', formato: 'v', marca: 'Toyota', tipo: 'SUV', hibrido: true, cliente: 'Zélia', cidade: 'Piúma', carro: 'Toyota Yaris Cross XRX Hybrid', alt: 'Zélia e uma acompanhante ao lado do Yaris Cross branco com laço vermelho' },
    { foto: 'entrega-sergio-1', formato: 'h', marca: 'Omoda', tipo: 'SUV', hibrido: true, cliente: 'Sérgio', cidade: 'Aracruz', carro: 'Omoda 5 SHEV', alt: 'Fabricio Teixeira e o cliente Sérgio sorrindo diante do carro coberto com laço' },
    { foto: 'entrega-jose-manoel-1', formato: 'v', marca: 'Chevrolet', tipo: 'Picape', cliente: 'José Manoel', cidade: 'Muniz Freire', carro: 'Chevrolet S10 LTZ', alt: 'Família do José Manoel ao lado da S10 com laço vermelho' },
    { foto: 'entrega-kelly-2', formato: 'h', marca: 'Volkswagen', tipo: 'SUV', cliente: 'Kelly', cidade: 'Aracruz', carro: 'VW T-Cross Sense', alt: 'Fabricio Teixeira e a cliente Kelly diante do T-Cross coberto com capa azul' },
    { foto: 'entrega-josenilton-1', formato: 'v', marca: 'Volkswagen', tipo: 'Hatch', cliente: 'Josenilton', cidade: 'Fundão', carro: 'VW Polo Track automático', alt: 'Josenilton e o filho ao lado do Polo branco com laço vermelho' },
    { foto: 'entrega-fernando-1', formato: 'h', marca: 'Fiat', tipo: 'Picape', cliente: 'Fernando', cidade: 'Aracruz', carro: 'Fiat Toro Freedom', alt: 'Fabricio Teixeira e o cliente Fernando dentro da Toro nova' },
    { foto: 'entrega-joacir-1', formato: 'v', marca: 'Fiat', tipo: 'Picape', cliente: 'Joacir', cidade: 'Aracruz', carro: 'Fiat Strada Freedom', alt: 'Joacir e a esposa ao lado da Strada coberta por capa vermelha com laço' },
    { foto: 'entrega-josenilton-2', formato: 'h', marca: 'Volkswagen', tipo: 'Hatch', cliente: 'Josenilton', cidade: 'Fundão', carro: 'VW Polo Track automático', alt: 'Fabricio Teixeira com Josenilton e o filho diante do Polo' },
    { foto: 'entrega-sergio-2', formato: 'v', marca: 'Omoda', tipo: 'SUV', hibrido: true, cliente: 'Sérgio', cidade: 'Aracruz', carro: 'Omoda 5 SHEV', alt: 'Omoda 5 branco na concessionária, pronto para a entrega' },
    { foto: 'entrega-zelia-2', formato: 'h', marca: 'Toyota', tipo: 'SUV', hibrido: true, cliente: 'Zélia', cidade: 'Piúma', carro: 'Toyota Yaris Cross XRX Hybrid', alt: 'Fabricio Teixeira com Zélia e uma acompanhante ao lado do Yaris Cross' },
    { foto: 'entrega-fernando-2', formato: 'v', marca: 'Fiat', tipo: 'Picape', cliente: 'Fernando', cidade: 'Aracruz', carro: 'Fiat Toro Freedom', alt: 'Fiat Toro branca com laço vermelho na concessionária' },
  ] as Entrega[],
  // Os clientes acima autorizaram aparecer no site? Mude para true quando confirmar.
  autorizacaoClientesConfirmada: false,

  // Vídeos das entregas. Só use vídeos com autorização do cliente e com o áudio conferido.
  videos: [
    { arquivo: 'depo-jose-manoel', formato: 'h', duracao: '1:26', titulo: 'Conversa na entrega', legenda: 'José Manoel e família · Muniz Freire', carro: 'Chevrolet S10 LTZ' },
    { arquivo: 'entrega-kelly', formato: 'v', duracao: '0:26', titulo: 'A revelação', legenda: 'Kelly · Aracruz', carro: 'VW T-Cross Sense' },
    { arquivo: 'entrega-joacir', formato: 'v', duracao: '0:21', titulo: 'Tirando a capa', legenda: 'Joacir · Aracruz', carro: 'Fiat Strada Freedom' },
    { arquivo: 'entrega-sergio', formato: 'v', duracao: '0:21', titulo: 'Pronto para rodar', legenda: 'Sérgio · Aracruz', carro: 'Omoda 5 SHEV' },
  ] as Video[],
  // O áudio dos vídeos foi conferido e quem aparece autorizou? Mude para true quando confirmar.
  videosConferidos: false,

  // Depoimentos reais e autorizados. Vazio = a seção NÃO aparece.
  // { nome: 'Nome Sobrenome', cidade: 'Aracruz', texto: '...', autorizado: true }
  depoimentos: [] as { nome: string; cidade: string; texto: string; autorizado: boolean }[],

  // Perguntas que ainda dependem do Fabricio (aparecem só na lista de pendências da revisão).
  perguntasAbertas: [
    { item: 'Confirmar: a arte de divulgação cita Nissan, que não está no adesivo. Ele vende Nissan?', impacto: 'Se sim, a lista e o número de marcas mudam.' },
    { item: 'Confirmar: Omoda e Jaecoo contam como uma marca só? (o adesivo mostra 15 logos)', impacto: 'Se forem 15, o número “14 marcas” muda no site todo.' },
  ],
};

/* ---------- Textos das seções ---------- */
export const TEXTOS = {
  seo: {
    titulo: 'Carro 0 km em Aracruz com um consultor só | FTS Multimarcas 0km · Fabricio Teixeira',
    descricao: 'Carro 0 km em Aracruz-ES sem rodar concessionária: o consultor Fabricio Teixeira pesquisa entre 14 marcas e cuida da sua compra. Atende Aracruz, Piúma, Fundão, João Neiva, Ibiraçu e Vitória.',
  },
  hero: {
    eyebrow: 'Carros 0 km · 14 marcas · Aracruz-ES',
    titulo: 'Seu próximo carro,',
    tituloDestaque: 'sem rodar concessionária.',
    sub: 'Eu sou o Fabricio. Pesquiso o seu carro entre 14 marcas de 0 km e cuido da compra do começo ao fim. Você fala com uma pessoa só, e eu vou até você.',
  },
  passos: [
    { titulo: 'Você me conta o que procura', texto: 'Pelo WhatsApp: tipo de carro, uso, orçamento, se tem usado para trocar.' },
    { titulo: 'Eu pesquiso entre as 14 marcas', texto: '' /* usa CONFIG.comoFunciona */ },
    { titulo: 'Você escolhe com calma', texto: 'Recebe as opções e decide com quem conhece todas as marcas do seu lado.' },
    { titulo: 'Eu te levo para buscar', texto: 'A entrega é na concessionária da marca. Eu te busco e te levo até lá.' },
  ],
  faq: [
    { p: 'Você vende só carro 0 km?', r: 'Principalmente 0 km, de 14 marcas. Também trabalho com alguns seminovos. É só perguntar.' },
    { p: 'Preciso ir até você?', r: 'Não. Eu vou até você. E no dia da entrega, te busco e te levo até a concessionária da marca.' },
    { p: 'Quais marcas você atende?', r: '' /* gerado a partir de CONFIG.marcas */ },
    { p: 'Quais cidades você atende?', r: 'Aracruz, Piúma, Fundão, João Neiva, Ibiraçu, Vitória e entorno, no Espírito Santo.' },
    { p: 'Atende PCD, taxista e produtor rural?', r: 'Sim. Atendo pessoa física, empresa, produtor rural, taxista, autoescola, locadora e PCD.' },
    { p: 'Você pega meu usado na troca?', r: '' /* CONFIG.respostas.avaliacaoUsado */, servico: 'avaliacaoUsado' },
    { p: 'Dá para financiar?', r: '' /* CONFIG.respostas.financiamento */, servico: 'financiamento' },
    { p: 'A FTS é uma empresa registrada?', r: 'Sim. FTS Multimarcas e Serviços Ltda, CNPJ 29.464.051/0001-56, ativa desde 2018, em Aracruz-ES.' },
    { p: 'Como eu começo?', r: 'Toque em qualquer botão verde. O WhatsApp abre com uma mensagem pronta dizendo o que você procura. É só enviar.' },
  ] as { p: string; r: string; servico?: 'avaliacaoUsado' | 'financiamento' }[],
};
