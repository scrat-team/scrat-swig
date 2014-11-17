var exports = module.exports;

exports.compile = function(compiler, args, content, parents, options, blockName) {
    var code = compiler(content, parents, options, blockName);
    return ';_output += "<head>";' + code + ';_output += _ctx._res.CSS_HOOK + "</head>";';
};

exports.parse = function(str, line, parser, types) {
    return true;
};

exports.ends = true;