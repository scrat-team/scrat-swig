'use strict';

const swig = require('../../../index');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const tag = 'require';
describe('Tags: ' + tag, function() {
  beforeEach(function() {
    swig.middleware({
      map: {},
    });
  });
  const root = path.resolve(__dirname, '../../fixtures/' + tag);
  const cases = [ 'general', 'urlparam_combo_overflow', 'ATF', 'ATF_combo', 'ATF_combo_domain' ];
  const load = function(label) {
    let locals = {};
    const r = root + '/' + label;
    swig.middleware({
      root: r,
      map: r + '/map.json',
    });
    if (fs.existsSync(r + '/data.json')) {
      locals = require(r + '/data.json');
    }
    return {
      file: r + '/test.tpl',
      data: locals,
      assert: fs.readFileSync(r + '/expect.html', 'utf8'),
    };
  };
  cases.forEach(function(label) {
    it(label, function() {
      const opt = load(label);
      const out = swig.renderFile(opt.file, opt.data);
      // fix window 换行和空格符 equal 不上
      const clearassert = opt.assert.replace(/\r\n|\s/g, '');
      const clearOut = out.replace(/\n|\s/g, '');
      assert(clearOut === clearassert);
      swig.cleanOptions();
    });
  });
});
