'use strict';
const parser = require('../parser');

exports.compile = function requireCompile(compiler, args) {
  let file = null;
  let ctx = [];
  args.forEach(function(arg) {
    if (arg.key === '$id') {
      file = arg.val;
    } else {
      ctx.push('"' + arg.key + '":' + arg.val);
    }
  });
  ctx = '{' + ctx.join(',') + '}';

  // 清除掉上文 $_ 开头的变量
  const clearPartParam = 'var pureCtx = {};_utils.each(_utils.keys(_ctx), function(key){ if (key.indexOf("__") !== 0) { pureCtx[key] = _ctx[key] }  })';
  return ';' + clearPartParam + ';_output += _ext._resource.include(' + file + ',_utils.extend({},pureCtx,' + ctx + '),_swig);';
};

exports.parse = parser.parse('$id');

exports.ends = false;
