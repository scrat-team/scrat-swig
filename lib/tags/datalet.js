/**
 * Set a variable for re-use in the current context. This will over-write any value already set to the context for the given <var>varname</var>.
 *
 * @alias datalet
 *
 * @example
 * {% datalet foo = "anything!" %}
 * {{ foo }}
 * // => anything!
 *
 * @example
 * // index = 2;
 * {% datalet bar = 1 %}
 * {% datalet bar += index|default(3) %}
 * // => 3
 *
 * @example
 * // foods = {};
 * // food = 'chili';
 * {% datalet foods[food] = "con queso" %}
 * {{ foods.chili }}
 * // => con queso
 *
 * @example
 * // foods = { chili: 'chili con queso' }
 * {% datalet foods.chili = "guatamalan insanity pepper" %}
 * {{ foods.chili }}
 * // => guatamalan insanity pepper
 *
 * @param {literal} varname   The variable name to assign the value to.
 * @param {literal} assignement   Any valid JavaScript assignement. <code data-language="js">=, +=, *=, /=, -=</code>
 * @param {*}   value   Valid variable output.
 */

'use strict';

exports.compile = function dataletCompile(compiler, args) {
  return args.join(' ') + ';\n';
};

exports.parse = function dataletParse(str, line, parser, types) {
  var nameSet = '';
  var propertyName;

  parser.on(types.VAR, function (token) { // eslint-disable-line space-before-function-paren, func-names
    if (propertyName) {
      // Tell the parser where to find the variable
      propertyName += '_ctx.' + token.match;
      return false;
    }

    if (!parser.out.length) {
      nameSet += token.match;
      return false;
    }
    return true;
  });

  parser.on(types.BRACKETOPEN, function (token) { // eslint-disable-line space-before-function-paren, func-names
    if (!propertyName && !this.out.length) {
      propertyName = token.match;
      return false;
    }
    return true;
  });

  parser.on(types.STRING, function (token) { // eslint-disable-line space-before-function-paren, func-names
    if (propertyName && !this.out.length) {
      propertyName += token.match;
      return false;
    }
    return true;
  });

  parser.on(types.BRACKETCLOSE, function (token) { // eslint-disable-line space-before-function-paren, func-names
    if (propertyName && !this.out.length) {
      nameSet += propertyName + token.match;
      propertyName = undefined;
      return false;
    }
    return true;
  });

  parser.on(types.DOTKEY, function (token) { // eslint-disable-line space-before-function-paren, func-names
    if (!propertyName && !nameSet) {
      return true;
    }
    nameSet += '.' + token.match;
  });

  parser.on(types.ASSIGNMENT, function (token) { // eslint-disable-line space-before-function-paren, func-names
    if (this.out.length || !nameSet) {
      throw new Error('Unexpected assignment "' + token.match + '" on line ' + line + '.');
    }
    this.out.push(
      // Prevent the set from spilling into global scope
      '_ext._resource._datalets.' + nameSet
    );
    this.out.push(token.match);
    this.filterApplyIdx.push(this.out.length);
  });
  return true;
};

exports.block = true;
