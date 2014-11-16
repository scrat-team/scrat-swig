exports.compile = function(compiler, args, content, parents, options, blockName){
  var id = args.shift();
  var code = compiler(content, parents, options, blockName);
  return [
    'if(_ctx._res.pageletStart(' + id + ')){',
      '_output += _ctx._res.pageletEnd(' + id + ', (function(){var _output="";' + code + ';return _output})());',
    '}'
  ].join('');
};

exports.parse = function(str, line, parser, types, stack, opts) {
  parser.on(types.STRING, function (token) {
    var self = this;
    self.out.push(token.match);
  });
  return true;
};

exports.ends = true;