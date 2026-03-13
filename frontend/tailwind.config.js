/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Colores principales ITESO
        primary:            'hsl(var(--primary) / <alpha-value>)',
        'primary-fg':       'hsl(var(--primary-fg) / <alpha-value>)',
        'primary-hover':    'hsl(var(--primary-hover) / <alpha-value>)',
        secondary:          'hsl(var(--secondary) / <alpha-value>)',
        'secondary-fg':     'hsl(var(--secondary-fg) / <alpha-value>)',
        'secondary-hover':  'hsl(var(--secondary-hover) / <alpha-value>)',
        accent:             'hsl(var(--accent) / <alpha-value>)',
        'accent-fg':        'hsl(var(--accent-fg) / <alpha-value>)',

        // Fondo y superficie
        bg:           'hsl(var(--bg) / <alpha-value>)',
        fg:           'hsl(var(--fg) / <alpha-value>)',
        card:         'hsl(var(--card) / <alpha-value>)',
        'card-fg':    'hsl(var(--card-fg) / <alpha-value>)',
        muted:        'hsl(var(--muted) / <alpha-value>)',
        'muted-fg':   'hsl(var(--muted-fg) / <alpha-value>)',
        popover:      'hsl(var(--popover) / <alpha-value>)',
        'popover-fg': 'hsl(var(--popover-fg) / <alpha-value>)',

        // Status / Feedback
        success:      'hsl(var(--success) / <alpha-value>)',
        'success-fg': 'hsl(var(--success-fg) / <alpha-value>)',
        warning:      'hsl(var(--warning) / <alpha-value>)',
        'warning-fg': 'hsl(var(--warning-fg) / <alpha-value>)',
        error:        'hsl(var(--error) / <alpha-value>)',
        'error-fg':   'hsl(var(--error-fg) / <alpha-value>)',
        info:         'hsl(var(--info) / <alpha-value>)',
        'info-fg':    'hsl(var(--info-fg) / <alpha-value>)',

        // Bordes e inputs
        border: 'hsl(var(--border) / <alpha-value>)',
        input:  'hsl(var(--input) / <alpha-value>)',
        ring:   'hsl(var(--ring) / <alpha-value>)',

        // Categorías
        'cat-books':       'hsl(var(--cat-books) / <alpha-value>)',
        'cat-electronics': 'hsl(var(--cat-electronics) / <alpha-value>)',
        'cat-clothing':    'hsl(var(--cat-clothing) / <alpha-value>)',
        'cat-supplies':    'hsl(var(--cat-supplies) / <alpha-value>)',

        // Botones / Acciones
        'btn-primary':        'hsl(var(--btn-primary-bg) / <alpha-value>)',
        'btn-primary-fg':     'hsl(var(--btn-primary-fg) / <alpha-value>)',
        'btn-secondary':      'hsl(var(--btn-secondary-bg) / <alpha-value>)',
        'btn-secondary-fg':   'hsl(var(--btn-secondary-fg) / <alpha-value>)',
        'btn-disabled':       'hsl(var(--btn-disabled-bg) / <alpha-value>)',
        'btn-disabled-fg':    'hsl(var(--btn-disabled-fg) / <alpha-value>)',
        'btn-tmpl':           'var(--btn-tmpl-bg)',
        'btn-tmpl-fg':        'hsl(var(--btn-tmpl-fg) / <alpha-value>)',
        'btn-tmpl-border':    'hsl(var(--btn-tmpl-border) / <alpha-value>)',
        'btn-tmpl-hover':     'hsl(var(--btn-tmpl-hover-bg) / <alpha-value>)',
      },
      fontFamily: {
        sans:  ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
        mono:  ['var(--font-mono)'],
      },
      fontSize: {
        // Escala tipográfica desde Figma
        h1:   ['var(--text-h1)',   { lineHeight: '2rem' }],
        h2:   ['var(--text-h2)',   { lineHeight: '1.75rem' }],
        h3:   ['var(--text-h3)',   { lineHeight: '1.5rem' }],
        body: ['var(--text-body)', { lineHeight: '1.5rem' }],
        sm:   ['var(--text-sm)',   { lineHeight: '1.25rem' }],
        xs:   ['var(--text-xs)',   { lineHeight: '1rem' }],
        // Tipografía decorativa
        'numeral-hero':    ['var(--numeral-hero)',    { lineHeight: '1' }],
        'numeral-hero-lg': ['var(--numeral-hero-lg)', { lineHeight: '1' }],
      },
      fontWeight: {
        normal:   'var(--font-normal)',
        medium:   'var(--font-medium)',
        semibold: 'var(--font-semibold)',
        bold:     'var(--font-bold)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        base:    'var(--radius)',
      },
    },
  },
  plugins: [],
};
