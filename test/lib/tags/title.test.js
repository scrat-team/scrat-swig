'use strict';
const swig = require('swig');
const assert = require('assert');
const sinon = require('sinon');

const tagName = 'title';
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
      pageletTitle(title) {
        return title;
      },
    };
    swig.setExtension('_resource', resourceInstance);
    spy = sinon.spy(resourceInstance, 'pageletTitle');
  });

  beforeEach(function() {
    spy.reset();
  });

  it('should render title', function() {
    assert(swig.render('{% title %}bar{% endtitle %}') === '<title>bar</title>');
    sinon.assert.calledWith(spy, 'bar');
    spy.reset();

    assert(swig.render('{% title %}{{foo.bar}}{% endtitle %}', context) === '<title>bar</title>');
    sinon.assert.calledWith(spy, 'bar');
    spy.reset();

    assert(swig.render('{% title %}test-{{foo.bar}}{% endtitle %}', context) === '<title>test-bar</title>');
    sinon.assert.calledWith(spy, 'test-bar');
    spy.reset();
  });
});
