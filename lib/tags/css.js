
var parser = require('../lib/parser');

exports.compile = function (compiler, args) {
    var file = null;
    var ctx = [];

    args.forEach(function(arg){
        if(arg.key === '$id'){
            file = arg.val;
        } else {
            ctx.push('"' + arg.key + '":' + arg.val);
        }
    });
    ctx = '{' + ctx.join(',') + '}';
    return ';_output += _ext._resource.includeCSS(' + file + ',_utils.extend({},_ctx,' + ctx + '));';
};
exports.parse = parser.parse('$id');
exports.ends = false;
