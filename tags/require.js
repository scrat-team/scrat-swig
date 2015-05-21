var parser = require('../lib/parser');

exports.compile = function (compiler, args) {
    var file = null;
    var group = 0;
    var ctx = [];
    args.forEach(function (arg) {
        if (arg.key === '$id') {
            file = arg.val;
        } else if (arg.key === '$group') {
            group = Number(arg.val);
            if (isNaN(group)) {
                throw new Error('Unexpected $group=' + arg.val + ', must be number, default to 0');
            }
        }
        else {
            ctx.push('"' + arg.key + '":' + arg.val);
        }
    });
    ctx = '{' + ctx.join(',') + '}';
    return ';_output += _ext._resource.include(' + file + ','  + group + ',_utils.extend({},_ctx,' + ctx + '));';
};
exports.parse = parser.parse('$id');
exports.ends = false;
