const path = require("path");

module.exports = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {
      // Sem source maps em producao: os .map iam para o servidor e expunham o
      // codigo-fonte completo, e com ele os nomes das tabelas do CRM e a forma
      // das consultas. Fica aqui e nao num .env.production porque esse esta no
      // gitignore, e num script do package.json a sintaxe seria dependente da
      // shell. Em desenvolvimento continuam ligados.
      if (webpackConfig.mode === 'production') {
        webpackConfig.devtool = false;
      }

      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/build/**',
          '**/dist/**',
          '**/coverage/**',
          '**/public/**',
        ],
      };
      return webpackConfig;
    },
  },
};
