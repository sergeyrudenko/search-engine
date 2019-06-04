module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true
    },
    "extends": "google",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        'no-trailing-spaces': 0,
        'require-jsdoc': 0,
        'no-undef': 0,
        'no-console': 0,
        'object-curly-spacing': 0,
        'guard-for-in': 0,
        'no-unused-vars': ['error', { 'vars': 'all', 'args': 'after-used', 'ignoreRestSiblings': false }],
        'quote-props': ['error', 'as-needed']
    }
};