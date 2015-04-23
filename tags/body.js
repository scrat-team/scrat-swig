/**
 * @alias body
 * @example
 * {%body%} something the page partial {%/body%}
 */

exports.compile = function (compiler, args, content, parents, options, blockName) {
  var attrs = args.map(function(arg){
    var result;
    if(arg.type === 'var'){
      result =  arg.key + '=\\"" + _ctx.' + arg.value + ' + "\\"'
    }else if(arg.type === 'string'){
      result = arg.key + "=" + arg.value.replace(/["\\]/g, '\\$&');
    }else if(arg.type === 'attr'){
      result = arg.key;
    }
    return result;
  });

  var code = compiler(content, parents, options, blockName);
  return '_output += "<body' + (attrs.length ? ' ' + attrs.join(' ') : '') + '>";' + code + '_output += _ext._resource.JS_HOOK + "</body>";';
};

exports.parse = function (str, line, parser, types, stack, opts) {
  var key = '';
  var assign = false;

  parser.on(types.STRING, function (token) {
    if (key && assign) {
      this.out.push({
        key: key,
        value: token.match,
        type: 'string'
      });
      key = '';
      assign = false;
    }
  });

  parser.on(types.ASSIGNMENT, function (token) {
    if (token.match === "=") {
      assign = true;
    }
  });

  parser.on(types.NUMBER, function (token) {
    var val = token.match;
    if (val && /^\-/.test(val) && key) {
      key += val;
    }
  });

  parser.on(types.OPERATOR, function (token) {
    var val = token.match;

    if (val === '-' && key) {
      key += val;
    }
  });

  parser.on(types.WHITESPACE, function(token){
    if(key){
      this.out.push({
        key: key,
        value: key,
        type: 'attr'
      });
      key = '';
      assign = false;
    }
  });

  parser.on(types.VAR, function (token) {
    if (key && assign) {
      this.out.push({
        key: key,
        value: token.match,
        type: 'var'
      });
      key = '';
      assign = false;
    }else{
      key += token.match;
    }
  });

  parser.on('end', function(){
    if(key){
      this.out.push({
        key: key,
        value: key,
        type: 'attr'
      });
      key = '';
      assign = false;
    }
  });

  return true;
};

exports.ends = true;