import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';

const eslintConfig = [
    ...nextCoreWebVitals,
    ...nextTypescript,
    prettier,
    {
        rules: {
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-debugger': 'error',
            'no-alert': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'sort-imports': ['error', { ignoreDeclarationSort: true }],
        },
    },
];

export default eslintConfig;
