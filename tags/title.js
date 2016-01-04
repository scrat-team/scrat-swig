/**
 * update document.title
 *
 * @alias title
 *
 * @example
 * {% title %}{{some_var}}{% endtitle %}
 */
'use strict';
exports.compile = function titleCompile(compiler, args, content, parents, options, blockName) {
  return ';_output+="<title>";' +
      ';_output+=_ext._resource.pageletTitle((function(){var _output="";' +
      compiler(content, parents, options, blockName) +
      ';return _output})())+"</title>";';
};

exports.parse = function titleParse() {
  return true;
};

exports.ends = true;