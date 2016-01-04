'use strict';

exports.compile = function atfCompile() {
  return ';_output+=_ext._resource.useATF();';
};

exports.parse = function atfParse() {
  return true;
};

exports.ends = false;