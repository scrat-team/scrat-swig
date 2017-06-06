/**
 * got real resource uri
 *
 * @alias uri
 *
 * @example
 * {% uri "/test.js"%}
 */
'use strict';
exports.compile = function uriCompile(compiler, args) {
  return '_output += _ext._resource.uri(' + args[0] + ');';
};

exports.parse = function uriParse() {
  return true;
};

exports.ends = false;
