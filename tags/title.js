var exports = module.exports;

exports.compile = function(compiler, args, content, parents, options, blockName) {
  var code = compiler(content, parents, options, blockName);
  return ';_output += "<title>" + _ctx.res.pageletTitle((function(){var _output="";' + code + ';return _output})()) + "</title>";';
};

exports.parse = function(str, line, parser, types) {
  return true;
};

exports.ends = true;