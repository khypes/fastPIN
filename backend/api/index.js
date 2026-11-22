// Vercel Function kirish nuqtasi. `npm run build` (nest build) dist/ ni yaratadi.
const mod = require('../dist/serverless');
module.exports = mod.default || mod;
