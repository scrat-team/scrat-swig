/**
 * @alias body
 *
 * @example
 * {% body class=[foo, "ss"] style="test" data-id=foo %} something the page partial {% endbody %}
 */

exports.compile = function (compiler, args, content, parents, options, blockName) {
  var attrs = args.map(function(arg){
    var result;
    if(arg.type === 'var'){
      result = arg.key + '=\\"" + (_ctx.' + arg.value + '||"") + "\\"'
    }else if(arg.type === 'string'){
      result = arg.key + "=" + arg.value.replace(/["\\]/g, '\\$&');
    }else if(arg.type === 'attr'){
      result = arg.key;
    }else if(arg.type === 'multi'){
      result = arg.key + '=\\""+';
      result += arg.value.map(function(item){
        if(item.type === 'var'){
          return '(_ctx.' + item.value + '||"")';
        }else if(item.type === 'string'){
          return item.value ;
        }
      }).join('+ " " + ');
      result += '+"\\"';
    }
    return result;
  });

  var code = '_output += "<body' + (attrs.length ? ' ' + attrs.join(' ') : '') + '>";'
      + compiler(content, parents, options, blockName)
      + '_output += _ext._resource.JS_HOOK + "</body>";';
  console.log(code)
  return code;
};

exports.parse = function (str, line, parser, types, stack, opts) {
  var key = '';
  var assign = false;
  var multi = false;
  var arr = [];

  parser.on(types.STRING, function (token) {
    if(multi){
      arr.push({
        value: token.match,
        type: 'string'
      })
    }else if (key && assign) {
      this.out.push({
        key: key,
        value: token.match,
        type: 'string'
      });
      key = '';
      assign = false;
    }
  });

  parser.on(types.VAR, function (token) {
    if(multi){
      arr.push({
        value: token.match,
        type: 'var'
      })
    }else if (key && assign) {
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

  parser.on(types.BRACKETOPEN, function(token){
    multi = true;
  });

  parser.on(types.BRACKETCLOSE, function(token){
    this.out.push({
      key: key,
      value: arr,
      type: 'multi'
    });
    key = '';
    assign = false;
    multi = false;
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

  parser.on(types.COMMA, function(token){
    if(multi && arr.length){

    }
  });

  parser.on(types.WHITESPACE, function(token){
    if(key && !multi){
      this.out.push({
        key: key,
        value: key,
        type: 'attr'
      });
      key = '';
      assign = false;
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