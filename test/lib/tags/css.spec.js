'use strict';

var swig = require('../../../index');
var expect = require('expect.js');
var path = require('path');
var fs = require('fs');
var tag = 'css';

describe('Tags: ' + tag, function() {
  beforeEach(function() {
    swig.middleware({
      map: {}
    });
  });
  var root = path.resolve(__dirname, '../../fixtures/' + tag);
  var cases = ['general'/*, 'urlparam_combo_overflow', 'ATF', 'ATF_combo', 'ATF_combo_domain'*/];
  var load = function(label) {
    var locals = {};
    var r = root + '/' + label;
    swig.middleware({
      root: r,
      map: r + '/map.json'
    });
    if (fs.existsSync(r + '/data.json')) {
      locals = require(r + '/data.json');
    }
    return {
      file: r + '/test.tpl',
      data: locals,
      expect: fs.readFileSync(r + '/expect.html', 'utf8')
    };
  };
  cases.forEach(function(label) {
    it(label, function() {
      var opt = load(label);
      var out = swig.renderFile(opt.file, opt.data);
      // fix window 换行和空格符 equal 不上
      var clearExpect = opt.expect.replace(/\r\n|\s/g, '');
      var clearOut = out.replace(/\n|\s/g, '');
      expect(clearOut).to.equal(clearExpect);
    });
  });
});
