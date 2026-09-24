// Os testes são de funções puras — preços, agenda, menu, páginas de serviço —
// e correm em Node, compilados pelo mesmo SWC do build.
const nextJest = require('next/jest');

module.exports = nextJest({ dir: __dirname })({});
