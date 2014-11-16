var exports = module.exports;

exports.compile = function(compiler, args) {
    return '_output += _ctx._res.uri(' + args.shift() + ');';
};

exports.parse = function() {
    return true;
};

exports.ends = true;