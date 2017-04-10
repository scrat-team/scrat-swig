'use strict';

var parser = require('../parser');

exports.compile = function(compiler, args) {
  var file = null;
  var ctx = [];

  args.forEach(function(arg) {
    if (arg.key === '$id') {
      file = arg.val;
    } else {
      ctx.push('"' + arg.key + '":' + arg.val);
    }
  });
  ctx = '{' + ctx.join(',') + '}';

  var clearPartParam = 'var pureCtx = {};_utils.each(_utils.keys(_ctx), function(key){ if (key.indexOf("__") !== 0) { pureCtx[key] = _ctx[key] }  })';
  return ';' + clearPartParam + ';_output += _ext._resource.includeCSS(' + file + ',_utils.extend({},pureCtx,' + ctx + '),_swig);';
};
exports.parse = parser.parse('$id');
exports.ends = false;
