'use strict';

var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'script';
var tag = require('../../tags/' + tagName);

describe('Tags: ' + tagName, function() {
  var spy;
  var context;
  var resourceInstance;

  before(function() {
    swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);
    context = {
      locals: {
        clz: 'test',
        foo: {
          bar: 'bar'
        }
      }
    };
    resourceInstance = {
      addScript: function(input) {
        return input;
      }
    };
    swig.setExtension('_resource', resourceInstance);
    spy = sinon.spy(resourceInstance, 'addScript');
  });

  it('should collect script', function() {
    expect(swig.render('{% script %}var a = "b\" + {{clz}};{% endscript %}', context)).to.equal('');
    sinon.assert.calledWith(spy, 'var a = "b" + test;');
    spy.reset();
  });
});