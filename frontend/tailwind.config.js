/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Colores principales ITESO
        primary:            'var(--primary)',
        'primary-fg':       'var(--primary-fg)',
        'primary-hover':    'var(--primary-hover)',
        secondary:          'var(--secondary)',
        'secondary-fg':     'var(--secondary-fg)',
        'secondary-hover':  'var(--secondary-hover)',
        accent:             'var(--accent)',
        'accent-fg':        'var(--accent-fg)',

        // Fondo y superficie
        bg:           'var(--bg)',
        fg:           'var(--fg)',
        card:         'var(--card)',
        'card-fg':    'var(--card-fg)',
        muted:        'var(--muted)',
        'muted-fg':   'var(--muted-fg)',
        popover:      'var(--popover)',
        'popover-fg': 'var(--popover-fg)',

        // Status / Feedback
        success:      'var(--success)',
        'success-fg': 'var(--success-fg)',
        warning:      'var(--warning)',
        'warning-fg': 'var(--warning-fg)',
        error:        'var(--error)',
        'error-fg':   'var(--error-fg)',
        info:         'var(--info)',
        'info-fg':    'var(--info-fg)',

        // Bordes e inputs
        border: 'var(--border)',
        input:  'var(--input)',
        ring:   'var(--ring)',

        // Categorías
        'cat-books':       'var(--cat-books)',
        'cat-electronics': 'var(--cat-electronics)',
        'cat-clothing':    'var(--cat-clothing)',
        'cat-supplies':    'var(--cat-supplies)',

        // Botones / Acciones
        'btn-primary':        'var(--btn-primary-bg)',
        'btn-primary-fg':     'var(--btn-primary-fg)',
        'btn-secondary':      'var(--btn-secondary-bg)',
        'btn-secondary-fg':   'var(--btn-secondary-fg)',
        'btn-disabled':       'var(--btn-disabled-bg)',
        'btn-disabled-fg':    'var(--btn-disabled-fg)',
        'btn-tmpl':           'var(--btn-tmpl-bg)',
        'btn-tmpl-fg':        'var(--btn-tmpl-fg)',
        'btn-tmpl-border':    'var(--btn-tmpl-border)',
        'btn-tmpl-hover':     'var(--btn-tmpl-hover-bg)',
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
