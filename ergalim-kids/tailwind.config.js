export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "Ergalim refinada" — infantil mas clean/comercial
        brand: {
          navy:   '#23306B',   // azul tinta — texto e primário sóbrio
          blue:   '#3B6FE0',   // azul vivo — links e destaques de ação
          pink:   '#F0568D',   // rosa suave (menos neon que antes)
          coral:  '#FF8A6B',   // coral quente — promoções
          mint:   '#2BB89A',   // verde — sucesso/frete grátis
          yellow: '#FFC24B',   // amarelo dourado — acento pontual
          ink:    '#1C2444',   // quase preto azulado — títulos
        },
        bg: {
          page:  '#FBFBFD',    // cinza-branco clean (estilo henri)
          card:  '#FFFFFF',
          soft:  '#F4F6FB',    // azul-cinza muito suave para seções
          warm:  '#FFF6F1',    // creme quente sutil
          mint:  '#EEF8F5',    // mint suave
        },
        line: '#EAECF2',       // cor padrão de bordas (hairline)
      },
      fontFamily: {
        // Display com personalidade arredondada + body neutra legível
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body:    ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.68rem', '1rem'],
      },
      borderRadius: {
        '4xl': '1.75rem',
        '5xl': '2.25rem',
      },
      boxShadow: {
        // Sombras suaves e modernas (sem offset sólido "cartoon")
        'soft':    '0 2px 8px rgba(28,36,68,0.06)',
        'card':    '0 4px 20px rgba(28,36,68,0.07)',
        'card-lg': '0 12px 32px rgba(28,36,68,0.10)',
        'pop':     '0 8px 28px rgba(240,86,141,0.18)',
      },
      keyframes: {
        fadeUp:   { from:{opacity:'0',transform:'translateY(12px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        fadeIn:   { from:{opacity:'0'}, to:{opacity:'1'} },
        pop:      { '0%': {transform:'scale(0.96)',opacity:'0'}, '100%': {transform:'scale(1)',opacity:'1'} },
        slide:    { from:{opacity:'0',transform:'translateX(20px)'}, to:{opacity:'1',transform:'translateX(0)'} },
        shimmer:  { '100%': {transform:'translateX(100%)'} },
      },
      animation: {
        fadeUp: 'fadeUp 0.45s ease-out both',
        fadeIn: 'fadeIn 0.5s ease-out both',
        pop:    'pop 0.3s cubic-bezier(0.34,1.4,0.64,1) both',
        slide:  'slide 0.4s ease-out both',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/aspect-ratio')],
}
