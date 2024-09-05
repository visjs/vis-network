module.exports = {
  extends: [require.resolve("vis-dev-utils/eslint-shareable-config")],
  overrides: [
    {
      files: ["**/*.js", "**/*.ts"],
      extends: ["plugin:jsdoc/recommended"],
      rules: {
        "jsdoc/check-examples": "off",
        "jsdoc/check-indentation": "off",
        "jsdoc/check-syntax": "warn",
        "jsdoc/check-tag-names": ["error", { definedTags: ["remarks"] }],
        "jsdoc/empty-tags": "warn",
        "jsdoc/no-undefined-types": "off",
        "jsdoc/require-description": "off",
        "jsdoc/require-jsdoc": "warn",
        "jsdoc/require-param-description": "off",
        "jsdoc/require-param-type": "off",
        "jsdoc/require-returns": "off",
        "jsdoc/require-returns-check": "off",
        "jsdoc/require-returns-description": "off",
        "jsdoc/require-returns-type": "off",
        "jsdoc/tag-lines": "off",
      },
      settings: {
        jsdoc: {
          tagNamePreference: {
            inheritdoc: "inheritDoc",
            typeparam: "typeParam",
          },
        },
      },
    },
  ],
};
