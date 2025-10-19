module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Relax limits to reduce noisy CI failures while keeping basic hygiene
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [1, 'always', 200],
    'footer-max-line-length': [1, 'always', 200],
  },
};
