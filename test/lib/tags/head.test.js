'use strict';

const swig = require('swig');
const assert = require('assert');

const tagName = 'head';
const tag = require('../../../lib/tags/' + tagName);
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags: ' + tagName, function() {
  let resourceInstance;
  before(function() {
    swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);
    resourceInstance = {
      JS_HOOK: '<!--SCRAT_JS_HOOK-->',
      CSS_HOOK: '<!--SCRAT_CSS_HOOK-->',
    };
    swig.setExtension('_resource', resourceInstance);
  });

  it('should render CSS_HOOK', function() {
    assert(swig.render('{% head %}<meta charset="utf-8"/>{% endhead %}') === '<head><meta charset="utf-8"/>' + resourceInstance.CSS_HOOK + '</head>');
  });
});
