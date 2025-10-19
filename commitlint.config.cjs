module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Relax limits to reduce noisy CI failures while keeping basic hygiene
    // Disable header length enforcement for now (long titles allowed)
    'header-max-length': [0, 'always', 120],
    'body-max-line-length': [1, 'always', 200],
    'footer-max-line-length': [1, 'always', 200],
  },
};
