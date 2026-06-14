export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta infantil vibrante
        brand: {
          navy:   '#1A2B6B',   // azul escuro (primário)
          pink:   '#FF3D9A',   // rosa quente (destaque)
          yellow: '#FFD600',   // amarelo alegre
          mint:   '#00C9A7',   // verde água
          sky:    '#4FC3F7',   // azul céu
          orange: '#FF7043',   // laranja energia
          purple: '#9C27B0',   // roxo playful
          lilac:  '#CE93D8',   // lilás suave
        },
        bg: {
          page:  '#FFF9F5',    // fundo creme quente
          card:  '#FFFFFF',
          soft:  '#FFF0F8',    // rosa suave para seções
          blue:  '#EEF4FF',    // azul suave para seções
          mint:  '#E8FBF7',    // mint suave
        },
      },
      fontFamily: {
        display: ['"Nunito"', 'system-ui', 'sans-serif'],
        body:    ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', '1rem'],
      },
      borderRadius: {
        'blob':  '60% 40% 70% 30% / 50% 60% 40% 50%',
        '4xl':  '2rem',
        '5xl':  '2.5rem',
      },
      boxShadow: {
        'kid':    '0 6px 0 0 rgba(0,0,0,0.12)',
        'kid-sm': '0 3px 0 0 rgba(0,0,0,0.1)',
        'kid-lg': '0 8px 0 0 rgba(0,0,0,0.14)',
        'fun':    '4px 4px 0 0 #1A2B6B',
        'fun-pink': '4px 4px 0 0 #FF3D9A',
      },
      keyframes: {
        wiggle:   { '0%,100%': {transform:'rotate(-3deg)'}, '50%': {transform:'rotate(3deg)'} },
        bounce2:  { '0%,100%': {transform:'translateY(0)'}, '50%': {transform:'translateY(-8px)'} },
        fadeUp:   { from:{opacity:'0',transform:'translateY(12px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        float:    { '0%,100%': {transform:'translateY(0) rotate(-2deg)'}, '50%': {transform:'translateY(-10px) rotate(2deg)'} },
        pop:      { '0%': {transform:'scale(0.8)',opacity:'0'}, '70%': {transform:'scale(1.1)'}, '100%': {transform:'scale(1)',opacity:'1'} },
        starSpin: { from:{transform:'rotate(0deg)'}, to:{transform:'rotate(360deg)'} },
      },
      animation: {
        wiggle:   'wiggle 0.5s ease-in-out',
        bounce2:  'bounce2 1.5s ease-in-out infinite',
        fadeUp:   'fadeUp 0.4s ease-out both',
        float:    'float 3s ease-in-out infinite',
        pop:      'pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        starSpin: 'starSpin 8s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/aspect-ratio')],
}
