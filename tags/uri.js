/**
 * got real resource uri
 *
 * @alias uri
 *
 * @example
 * {% uri "/test.js"%}
 */

exports.compile = function (compiler, args) {
    return '_output += _ext._resource.uri(' + args[0] + ');';
};

exports.parse = function () {
    return true;
};

exports.ends = false;