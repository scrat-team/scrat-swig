'use strict';

const swig = require('swig');
const assert = require('assert');

const tagName = 'body';
const tag = require('../../../lib/tags/' + tagName);

describe('Tags: ' + tagName, function() {
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
      JS_HOOK: '<!--SCRAT_JS_HOOK-->',
      CSS_HOOK: '<!--SCRAT_CSS_HOOK-->',
    };
    swig.setExtension('_resource', resourceInstance);
  });

  it('should render JS_HOOK', function() {
    assert(swig.render('{% body %}<h1>test</h1>{% endbody %}') === '<body><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('should render attr', function() {
    assert(swig.render('{% body class=["test1", clz] style="test" data-src=foo.bar data-test%}<h1>test</h1>{% endbody%}', context) === '<body class="test1 test" style="test" data-src="bar" data-test><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });
});
