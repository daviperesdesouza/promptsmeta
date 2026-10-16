// Mensagens prontas do WhatsApp por intenção + categoria.
// Usado no build (HTML estático) e no navegador (quando a pessoa escolhe uma categoria).

export type Intencao = 'encontrar' | 'condicoes' | 'usado' | 'frota';

const ALVO: Record<string, string> = {
  'SUV': 'um SUV',
  'Picape': 'uma picape',
  'Sedã': 'um sedã',
  'Hatch': 'um hatch',
  'Elétrico/Híbrido': 'um elétrico ou híbrido',
};

export function mensagem(intencao: Intencao, categoria = ''): string {
  const a = ALVO[categoria] || '';
  const oi = 'Olá, Fabricio! Vim pelo site e ';
  switch (intencao) {
    case 'condicoes': return oi + `quero saber as condições para ${a || 'um carro 0 km'}.`;
    case 'usado': return oi + `quero avaliar meu usado na troca por ${a || 'um carro 0 km'}. Meu carro atual é: `;
    case 'frota': return oi + 'quero falar sobre a frota da minha empresa.' + (a ? ` Temos interesse em ${a}.` : '');
    default: return oi + 'quero encontrar meu próximo carro.' + (a ? ` Estou procurando ${a}.` : '');
  }
}

export function linkWhatsApp(numero: string, intencao: Intencao, categoria = ''): string {
  return `https://wa.me/${String(numero).replace(/\D/g, '')}?text=${encodeURIComponent(mensagem(intencao, categoria))}`;
}
