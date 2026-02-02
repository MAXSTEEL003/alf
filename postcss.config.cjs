const purgecss = require('@fullhuman/postcss-purgecss');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    require('autoprefixer'),
    isProd && purgecss({
      content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}',
      ],
      defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
      safelist: {
        standard: [
          // Font Awesome & icon classes
          /^fa[srb]?$/, /^fa-/,
          // Core layout/utilities used throughout
          /^container$/, /^content-wrapper$/, /^header$/, /^main$/, /^footer$/, /^logo$/, /^main-nav$/, /^nav-link/,
          /^white-text$/, /^hover-/, /^glass-effect$/, /^text-/, /^btn/, /^dropdown/, /^mobile-/,
          // Loading & states
          /^loading$/, /^loading-spinner$/, /^page-loading$/, /^glow-effect$/, /^animate-/,
          // Admin & tracking naming
          /^admin-/, /^order-/, /^col-/, /^status-badge/, /^share-/, /^checkpoint/, /^checkpoints?/, /^route-/,
          // Sections on home pages
          /^hero-/, /^stats-/, /^services?/, /^features?/, /^benefit-/, /^section-/, /^enquiry-/, /^trust-/, /^form-/,
        ],
      },
    }),
  ].filter(Boolean),
};
