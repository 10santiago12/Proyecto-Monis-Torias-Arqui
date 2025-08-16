/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: "script" },
  extends: ["eslint:recommended", "google"],
  rules: {
    // Evitar bloqueos por estilo en Windows y para demo
    "linebreak-style": "off",
    "require-jsdoc": "off",
    "max-len": "off",
    "object-curly-spacing": "off",
    "comma-dangle": "off",
    "brace-style": "off",
    "new-cap": "off",
    "key-spacing": "off",
    "comma-spacing": "off",
    "arrow-parens": "off",
    "operator-linebreak": "off",
    // Mantén dobles comillas si te gusta así:
    "quotes": ["error", "double", { "allowTemplateLiterals": true }],
    // No forzar arrow callbacks
    "prefer-arrow-callback": "off"
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: { mocha: true },
      rules: {}
    }
  ],
  globals: {}
};
