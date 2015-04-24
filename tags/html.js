/**
 * @alias html
 *
 * @example
 * {% html class=[foo, "ss"] style="test" data-id=foo %} something the page partial {% endhtml %}
 */

var parser = require('../lib/parser');
exports.compile = function(compiler, args, content, parents, options, blockName) {
    return ';_ext._resource = new _ext.Resource(_ext._map);' +
           ';_ext._resource.usePagelet(_ctx._pagelets);' +
           ';_output += "<html"' + parser.attr(args) + '+">";' +
           compiler(content, parents, options, blockName) +
           ';_output += "</html>";' +
           ';_output = _ext._resource.render(_output);';
};
exports.parse = parser.parse();
exports.ends = true;