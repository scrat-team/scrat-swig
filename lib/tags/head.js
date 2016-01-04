/**
 * append CSS_HOOK to head
 *
 * @alias head
 *
 * @example
 * {% head %}<meta charset="utf-8"/>{% endhead %}
 */

'use strict';
var parser = require('../parser');

exports.compile = function headCompile(compiler, args, content, parents, options, blockName) {
  return ';_output += "<head"' + parser.attr(args) + '+">";' +
          compiler(content, parents, options, blockName) +
          ';_output += _ext._resource.CSS_HOOK + "</head>";';
};
exports.parse = parser.parse();
exports.ends = true;