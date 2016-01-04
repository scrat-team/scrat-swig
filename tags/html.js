/**
 * collect pagelet output and render
 *
 * @alias html
 *
 * @example
 * {% html class=[foo, "ss"] style="test" data-id=foo %} something the page partial {% endhtml %}
 */
'use strict';
var parser = require('../lib/parser');
exports.compile = function htmlCompile(compiler, args, content, parents, options, blockName) {
  var cdn = '';
  args = args.filter(function(arg) {
    var keep = true;
    if (arg.key === 'cdn') {
      keep = false;
      cdn = arg.val;
    }
    return keep;
  });
  return ';_ext._resource = new _ext.Resource(_ext._map);' +
      ';_ext._resource.usePagelet(_ctx._pagelets);' +
      ';_ext._resource.setDomain(' + cdn + ');' +
      ';_output += "<html"' + parser.attr(args) + '+">";' +
      compiler(content, parents, options, blockName) +
      ';_output += "</html>";' +
      ';_output = _ext._resource.render(_output);';
};
exports.parse = parser.parse();
exports.ends = true;