var exports = module.exports;

exports.compile = function(compiler, args) {
    return '_output += _ext._resource.uri(' + args.shift() + ');';
};

exports.parse = function() {
    return true;
};

exports.ends = false;