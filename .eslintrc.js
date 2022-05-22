
module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint'],
    settings: {},
    rules: {
        '@typescript-eslint/no-var-requires': ['off'],
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/explicit-function-return-type': ['off'],
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        '@typescript-eslint/curly': ['off'],
        'no-debugger': ['warn'],
        'react/display-name': ['off'],
        'react/prop-types': ['off'],
        'react/jsx-no-target-blank': ['off'],
        semi: ['warn', 'never'],
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
}