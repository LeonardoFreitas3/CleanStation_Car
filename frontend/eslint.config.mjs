import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';

// As regras dos hooks e mais nenhuma. Eram as que o craco acrescentava ao
// ESLint do CRA, que corria dentro do build; o next build não corre ESLint, e
// um hook dentro de um if não dá erro de compilação — rebenta em quem visita.
export default [
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    languageOptions: { parser: tsParser },
    // Há disables para regras do CRA que aqui não existem.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
