'use strict';

module.exports = {
  write: true,
  prefix: '^',
  test: [
    'test',
    'benchmark',
  ],
  dep: [
    'swig',
  ],
  devdep: [
    'egg-bin',
    'autod',
    'eslint',
    'mockjs',
    'sinon',
    'eslint-config-egg'
  ],
  exclude: [
    './test/fixtures',
  ]
};
