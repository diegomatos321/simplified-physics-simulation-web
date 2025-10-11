// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import importPlugin from 'eslint-plugin-import';

export default [
    // Configuração base do JavaScript moderno
    js.configs.recommended,

    // Configuração base para TypeScript (com suporte ao parser e regras)
    ...tseslint.configs.recommended,

    // Plugins adicionais
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
            import: importPlugin,
        },
        rules: {
            // ---------- TypeScript ----------
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/consistent-type-imports': [
                'warn',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: false,
                },
            ],

            // ---------- Imports ----------
            'simple-import-sort/imports': 'warn',
            'simple-import-sort/exports': 'warn',
            'import/no-unresolved': 'off', // Vite resolve paths automaticamente
            'import/order': 'off',

            // ---------- Geral ----------
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
        },
    },

    // Integração com Prettier (desativa regras de formatação conflitantes)
    prettier,

    // Ignorar pastas compiladas e de dependências
    {
        ignores: ['dist', 'node_modules'],
    },
];
