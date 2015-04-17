/**
 * @alias body
 * @example
 * {%body%} something the page partial {%/body%}
 */

exports.compile = function (compiler, args, content, parents, options, blockName) {
  var attrs = [];

  args.forEach(function (arg) {
    if (arg.key) {
      if (arg.key === "attrs") {
        attrs.push(arg.value);
      } else {
        attrs.push(arg.key + "=" + arg.raw);
      }
    }
  });
  var code = compiler(content, parents, options, blockName);
  attrs = attrs.length ? ' ' + attrs.join(' ').replace(/["\\]/g, '\\$&') : '';
  return '_output += "<body' + attrs + '>";' + code + '_output += _ext._resource.JS_HOOK + "</body>";';
};

exports.parse = function (str, line, parser, types, stack, opts) {
  var key = '',
    assign;

  parser.on(types.STRING, function (token) {
    if (key && assign) {
      var raw = token.match;
      var val = raw.substring(1, raw.length - 1);

      this.out.push({
        key: key,
        value: val,
        raw: raw
      });

      key = assign = '';
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

  parser.on(types.VAR, function (token) {
    key += token.match;
    assign = false;
    return false;
  });

  return true;
};

exports.ends = true;