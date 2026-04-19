/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // v2 warm palette — see DESIGN_SPEC.md
      colors: {
        // Neutrals / surfaces
        page:          '#FAF6EC', // page background
        cream:         '#FAF7F0', // card surface
        beige:         '#F0EBE0', // hover / nav / subtle fill
        taupe: {
          DEFAULT:     '#E0D9C4', // standard border
          emphasis:    '#D4CCB8', // section divider / stronger border
        },

        // Text
        ink: {
          DEFAULT:     '#4A3F32', // primary text (warm brown)
          muted:       '#6B6354', // secondary text (warm brown-gray)
        },

        // Exercise type accents (base + light fill + dark text)
        'lower-body': {
          DEFAULT:     '#8FA968',
          fill:        '#E5EDD5',
          ink:         '#4A5C36',
        },
        'upper-body': {
          DEFAULT:     '#6F89A8',
          fill:        '#DEE5EE',
          ink:         '#3D4F66',
        },
        'abs-core': {
          DEFAULT:     '#C8855E',
          fill:        '#EDD9C9',
          ink:         '#7A4A2C',
        },
        'peak-8': {
          DEFAULT:     '#B89856',
          fill:        '#EBE0C2',
          ink:         '#6B5410',
        },

        // Semantic accents
        pr: {
          fill:        '#F0E3C2', // PR badge background (pale gold)
          ink:         '#6B5410', // PR badge text
        },
        warn: {
          fill:        '#D4A296', // recovery warning (soft coral)
          ink:         '#B85040',
        },
        success:       '#8FA968', // same as lower-body accent
      },

      // Typography — spec uses system sans stack, 400/500 weights, compact sizes
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"',
          'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
          '"Helvetica Neue"', 'sans-serif',
        ],
      },
      fontSize: {
        // micro labels (uppercase 10px w/ letter-spacing applied per-instance)
        'micro':     ['10px', { lineHeight: '1.4' }],
        // body scale
        'tiny':      ['11px', { lineHeight: '1.4' }],
        'xs-warm':   ['12px', { lineHeight: '1.5' }],
        'sm-warm':   ['13px', { lineHeight: '1.5' }],
        // headings per spec
        'h3-warm':   ['13px', { lineHeight: '1.4', fontWeight: '500' }],
        'h2-warm':   ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'h1-warm':   ['18px', { lineHeight: '1.3',  fontWeight: '500' }],
      },
      letterSpacing: {
        'micro': '0.05em',
      },

      // Radius per spec
      borderRadius: {
        'card':    '10px',
        'input':   '6px',
        'progress': '3px',
      },

      // Shadow — minimal, subtle
      boxShadow: {
        'tab':  '0 1px 2px rgba(0,0,0,0.04)',
        'card': '0 1px 2px rgba(0,0,0,0.04)',
      },

      // Hairline border (used as 'border-[0.5px]' via arbitrary, but kept here for reference)
      borderWidth: {
        'hair': '0.5px',
      },
    },
  },
  plugins: [],
}
