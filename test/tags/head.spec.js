'use strict';

var swig = require('swig');
var expect = require('expect.js');

var tagName = 'head';
var tag = require('../../tags/' + tagName);
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags: ' + tagName, function() {
  var resourceInstance;
  before(function() {
    swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);
    resourceInstance = {
      'JS_HOOK': '<!--SCRAT_JS_HOOK-->',
      'CSS_HOOK': '<!--SCRAT_CSS_HOOK-->'
    };
    swig.setExtension('_resource', resourceInstance);
  });

  it('should render CSS_HOOK', function() {
    expect(swig.render('{% head %}<meta charset="utf-8"/>{% endhead %}')).to.equal('<head><meta charset="utf-8"/>' + resourceInstance.CSS_HOOK + '</head>');
  });
});