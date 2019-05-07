module.exports = {
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  rules: {
    //   'no-continue': 'off',
    'no-console': 'off',
    //   'func-names': 'off', // Good, but off for now
    //   'no-unused-vars': 'off', // GOOD, but has to remain off until fhir hooks are integrated properly
    //   'no-undef': 'off', // GOOD, but has to remain off until fhir hooks are integrated properly (should do this ASAP as no-undef is really important)
    'no-use-before-define': ['error', { functions: false }],
    //   'no-tabs': 'off', // Fix and Remove,
    //   'no-mixed-spaces-and-tabs': 'off', // Fix and Remove
    //   'no-empty': 'off', // Fix and Remove
    //   'no-lonely-if': 'off', // Fix and Remove
    //   'no-useless-concat': 'off', // Fix and Remove
    //   'no-cond-assign': 'off', // Fix and Remove
    //   'no-mixed-operators': 'off', // Fix and Remove
    //   'no-useless-escape': 'off', // Fix and Remove
    //   'no-buffer-constructor': 'off', // Fix and Remove
    //   'no-bitwise': 'off', // Fix and Remove
    //   'radix': 'off', // Fix and Remove
    //   'new-cap': 'off', // Fix and Remove
    //   'prefer-rest-params': 'off', // Fix and Remove
    //   'array-callback-return': 'off', // Fix and Remove
    //   'block-scoped-var': 'off', // Fix and Remove
    //   'no-redeclare': 'off', // Fix and Remove
    //   'class-methods-use-this': 'off', // Fix and Remove
    //   'no-restricted-properties': 'off', // Fix and Remove
    //   'no-loop-func': 'off', // Fix and Remove
    //   'no-unused-expressions': 'off', // Fix and Remove

    'no-underscore-dangle': 'off', // Fix and Remove
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    //   'no-var': 'off', // Fix and Remove
    //   'prefer-const': 'off', // Fix and Remove
    //   eqeqeq: 'off', // Fix and Remove
    //   camelcase: 'off', // Fix and Remove
    //   'vars-on-top': 'off', // GOOD except no-vars is on so this might be irrelevant
    'max-len': 'off', //what should our max character length be? 100 is recommended GOOD
    'arrow-parens': 'off', // GOOD  [2, "as-needed"],
    //   'no-else-return': 'off', // BAD, but should follow
    //   'one-var': 'off',
    //   'on-var-declaration-per-line': 'off', // STILL NEED TO DISCUSS
    //   'no-throw-literal': 'off', // GOOD
    //   'array-bracket-spacing': 'off', // GOOD
    //   'object-shorthand': 'off', // BAD
    //   'arrow-body-style': 'off', // BAD
    //   'no-confusing-arrow': 'off', // GOOD
    //   'prefer-promise-reject-errors': 'off', // GOOD BUT OFF UNTIL WE DECIDE TO TAKE ON THIS EFFORT
    //   'object-curly-newline': 'off', //--> this is a heated one do you want all methods to be on
    'no-param-reassign': 'off', // BAD deals with pure functions and not touching inputs
    //   'brace-style': 'off', // GOOD
    //   'prefer-destructuring': 'off', // GOOD
    //   'no-shadow': 'off', // GOOD
    //   'no-plusplus': 'off', // OFF FOR NOW
    //   'default-case': 'off', // GOOD
    //   'no-restricted-globals': 'off', // GOOD (i.e. use Number.isNaN instead of isNaN because isNaN will coerce a value before checking) isNaN("a") returns true while isNaN("") returns false
    //   'no-return-assign': 'off', // GOOD
    //   'consistent-return': 'off', // BAD this one will be highly debated as we sometimes don't return anything, but also makes sure we thing about what will happen if we don't return anything and then use the reference in the next then clause: users.js line 755
    //   'guard-for-in': 'off', // GOOD
    //   'no-restricted-syntax': 'off', // BAD, good practice but non revision
    //   'no-prototype-builtins': 'off', // GOOD
  },
};
