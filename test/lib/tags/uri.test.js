'use strict';

const swig = require('swig');
const assert = require('assert');
const sinon = require('sinon');

const tagName = 'uri';
const tag = require('../../../lib/tags/' + tagName);

describe('Tags: ' + tagName, function() {
  let spy;
  let resourceInstance;

  before(function() {
    swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);
    resourceInstance = {
      uri(input) {
        return '/public' + input;
      },
    };
    swig.setExtension('_resource', resourceInstance);
    spy = sinon.spy(resourceInstance, 'uri');
  });

  it('should render real uri', function() {
    assert(swig.render('{% uri "/test" %}') === '/public/test');
    sinon.assert.calledWith(spy, '/test');
    spy.reset();
  });
});
