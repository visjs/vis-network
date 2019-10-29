module.exports = {
  env: {
    "cypress/globals": true,
    browser: true,
    es6: true,
    node: true,
    mocha: true
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2019,
    project: 'tsconfig.json',
  },

  plugins: ["prettier", "@typescript-eslint", "cypress"],

  extends: ['eslint:recommended', 'prettier'],

  // For the full list of rules, see: http://eslint.org/docs/rules/
  rules: {
    'prettier/prettier': ['off'],

    complexity: [2, 55],
    "max-statements": [2, 115],
    "no-unreachable": 1,
    "no-useless-escape": 0,

    "no-console": 0,
    // To flag presence of console.log without breaking linting:
    //"no-console": ["warn", { allow: ["warn", "error"] }],

    "require-jsdoc": ["error", {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false
        }
    }],
    "valid-jsdoc": [2, {
      requireReturnDescription: false,
      requireReturn: false,
      requireParamDescription: false,
      requireReturnType: true
    }],
    "guard-for-in": 1,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.d.ts'],
      rules: {
        'prettier/prettier': ['error'],

        // @TODO: Seems to mostly work just fine but I'm not 100 % sure.
        // @TODO: Deprecated, anything like this for tsdoc?
        'valid-jsdoc': [
          'error',
          {
            prefer: {
              arg: 'param',
              argument: 'param',
              return: 'returns',
            },
            requireParamDescription: true,
            requireParamType: false,
            requireReturn: false, // Requires return for void functions.
            requireReturnDescription: true,
            requireReturnType: false,
          },
        ],

        // Class related.
        '@typescript-eslint/member-naming': [
          'error',
          { private: '^_', protected: '^_', public: '^[^_]' },
        ],
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/prefer-readonly': 'error',

        // Other.
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/prefer-includes': 'error',
        '@typescript-eslint/prefer-regexp-exec': 'error',
        // @TODO: Seems like a good thing, not yet on npm though.
        // '@typescript-eslint/require-await': 'error',

        // These are hoisted, I have no idea why it reports them by default.
        '@typescript-eslint/no-use-before-define': [
          'error',
          { functions: false, classes: false, typedefs: false },
        ],
        // False positives for overloading, also tsc compiles with errors anyway.
        'no-dupe-class-members': 'off',
        // Blocks typesafe exhaustive switch (switch (x) { … default: const never: never = x }).
        'no-case-declarations': 'off',
        // Reports used types.
        'no-unused-vars': 'off',
        // Reports typeof bigint as an error, tsc validates this anyway so no problem turning this off.
        'valid-typeof': 'off',
      },
    },
    {
      files: [
        "lib/network/gephiParser.ts",
        "test/NodesHandler.test.ts",
        "test/dot-parser/dot-parser.test.ts",
        "test/edges/bezier-edge-dynamic.test.ts",
        "test/edges/bezier-edge-static.test.ts",
        "test/edges/cubic-bezier-edge.test.ts",
        "test/edges/edge-base.test.ts",
        "test/edges/end-points.test.ts",
        "test/edges/helpers.ts",
        "test/edges/straight-edge.test.ts",
        "test/gephi-parser.test.ts",
        "test/helpers/index.ts"
      ],
      rules: {
        "prettier/prettier": [
          "error",
          {
            endOfLine: "lf",
            parser: "typescript",
            printWidth: 80,
            quoteProps: "consistent",
            semi: false,
            singleQuote: true,
            tabWidth: 2,
            trailingComma: "es5",
            useTabs: false
          }
        ],

        // @TODO: Seems to mostly work just fine but I'm not 100 % sure.
        // @TODO: Deprecated, anything like this for tsdoc?
        "valid-jsdoc": [
          "error",
          {
            prefer: {
              arg: "param",
              argument: "param",
              return: "returns"
            },
            requireParamDescription: true,
            requireParamType: false,
            requireReturn: false, // Requires return for void functions.
            requireReturnDescription: true,
            requireReturnType: false
          }
        ],

        // Class related.
        "@typescript-eslint/member-naming": [
          "error",
          { private: "^_", protected: "^_", public: "^[^_]" }
        ],
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-useless-constructor": "error",
        "@typescript-eslint/prefer-readonly": "error",

        // Other.
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/prefer-includes": "error",
        "@typescript-eslint/prefer-regexp-exec": "error",
        // @TODO: Seems like a good thing, not yet on npm though.
        // "@typescript-eslint/require-await": "error",

        // These are hoisted, I have no idea why it reports them by default.
        "@typescript-eslint/no-use-before-define": [
          "error",
          { functions: false, classes: false, typedefs: false }
        ],
        // False positives for overloading, also tsc compiles with errors anyway.
        "no-dupe-class-members": "off",
        // Blocks typesafe exhaustive switch (switch (x) { … default: const never: never = x }).
        "no-case-declarations": "off",
        // Reports used types.
        "no-unused-vars": "off",
        // Reports typeof bigint as an error, tsc validates this anyway so no problem turning this off.
        "valid-typeof": "off"
      }
    },
  ]
};
