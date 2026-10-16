// Configuração do Astro: site estático com ilhas React só onde há interação.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  build: {
    // CSS embutido no HTML: uma requisição a menos antes de pintar a página.
    inlineStylesheets: 'always',
  },
  image: {
    // Os tamanhos e formatos de cada foto são definidos nos componentes.
    responsiveStyles: false,
  },
  devToolbar: { enabled: false },
});
