/**
 * @alias body
 *
 * @example
 * {% body class=[foo, "ss"] style="test" data-id=foo %} something the page partial {% endbody %}
 */

var parser = require('../lib/parser');
exports.compile = function (compiler, args, content, parents, options, blockName) {
    return ';_output += "<body"' + parser.attr(args) + '+">";' +
           compiler(content, parents, options, blockName) + ';' +
           '_output += _ext._resource.JS_HOOK + "</body>";';
};
exports.parse = parser.parse();
exports.ends = true;