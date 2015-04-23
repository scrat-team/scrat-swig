/**
 * Used to update document.title
 */

exports.compile = function(compiler, args, content, parents, options, blockName) {
  var code = compiler(content, parents, options, blockName);
  return ';_output += "<title>" + _ext._resource.pageletTitle((function(){var _output="";' + code + ';return _output})()) + "</title>";';
};

exports.parse = function(str, line, parser, types) {
  return true;
};

exports.ends = true;