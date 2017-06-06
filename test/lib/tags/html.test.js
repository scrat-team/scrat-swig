'use strict';

const swig = require('swig');
const assert = require('assert');

const tagName = 'html';
const tag = require('../../../lib/tags/' + tagName);

const Resource = require('../../../lib/resource');
const JS_HOOK = Resource.prototype.JS_HOOK;
const CSS_HOOK = Resource.prototype.CSS_HOOK;

swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags: ' + tagName, function() {
  let context;

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
    swig.setExtension('Resource', Resource);
    swig.setExtension('_map', {});
  });

  it('should replace JSHOOK', function() {
    assert(swig.render('{% html %}<h1>test' + JS_HOOK + '</h1>{% endhtml %}') === '<html><h1>test<script>pagelet&&pagelet.init&&pagelet.init(0,"/co??%s",[""],"0000000");</script>\n</h1></html>');
    assert(swig.render('{% html %}<h1>' + JS_HOOK + 'test' + JS_HOOK + '</h1>{% endhtml %}') === '<html><h1>' + JS_HOOK + 'test<script>pagelet&&pagelet.init&&pagelet.init(0,"/co??%s",[""],"0000000");</script>\n</h1></html>');
  });

  it('should replace CSSHOOK', function() {
    assert(swig.render('{% html %}<h1>test' + CSS_HOOK + '</h1>{% endhtml %}') === '<html><h1>test</h1></html>');
    assert(swig.render('{% html %}<h1>' + CSS_HOOK + 'test' + CSS_HOOK + '</h1>{% endhtml %}') === '<html><h1>test' + CSS_HOOK + '</h1></html>');
  });

  it('should render attr', function() {
    assert(swig.render('{% html class=["test1", clz] style="test" data-src=foo.bar ng-app%}<h1>test</h1>{% endhtml %}', context) === '<html class="test1 test" style="test" data-src="bar" ng-app><h1>test</h1></html>');
  });
});
