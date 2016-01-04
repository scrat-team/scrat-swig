'use strict';

var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'uri';
var tag = require('../../../lib/tags/' + tagName);

describe('Tags: ' + tagName, function() {
  var spy;
  var resourceInstance;

  before(function() {
    swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);
    resourceInstance = {
      uri: function(input) {
        return '/public' + input;
      }
    };
    swig.setExtension('_resource', resourceInstance);
    spy = sinon.spy(resourceInstance, 'uri');
  });

  it('should render real uri', function() {
    expect(swig.render('{% uri "/test" %}')).to.equal('/public/test');
    sinon.assert.calledWith(spy, '/test');
    spy.reset();
  });
});
