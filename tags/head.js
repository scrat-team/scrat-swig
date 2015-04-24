var parser = require('../lib/parser');

exports.compile = function(compiler, args, content, parents, options, blockName) {
    return ';_output += "<head"' + parser.attr(args) + '+">";' +
           compiler(content, parents, options, blockName) +
           ';_output += _ext._resource.CSS_HOOK + "</head>";';
};
exports.parse = parser.parse();
exports.ends = true;