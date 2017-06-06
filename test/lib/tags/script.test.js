'use strict';

const swig = require('swig');
const assert = require('assert');
const sinon = require('sinon');

const tagName = 'script';
const tag = require('../../../lib/tags/' + tagName);

describe('Tags: ' + tagName, function() {
  let spy;
  let context;
  let resourceInstance;

  before(function() {
    swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);
    context = {
      locals: {
        clz: 'test',
        foo: {
          bar: 'bar',
        },
      },
    };
    resourceInstance = {
      addScript(input) {
        return input;
      },
    };
    swig.setExtension('_resource', resourceInstance);
    spy = sinon.spy(resourceInstance, 'addScript');
  });

  it('should collect script', function() {
    assert(swig.render('{% script %}var a = "b\" + {{clz}};{% endscript %}', context) === '');
    sinon.assert.calledWith(spy, 'var a = "b" + test;');
    spy.reset();
  });
});
