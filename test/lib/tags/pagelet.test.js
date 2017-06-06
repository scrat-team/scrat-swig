'use strict';

const assert = require('assert');
const swig = require('../../../index');

describe('Tags: pagelet', function() {
  beforeEach(function() {
    swig.middleware({
      map: {},
    });
  });
  it('tag attribute', function() {
    let tpl = '{% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, {}) === '<html><div data-pagelet="main">hello</div></html>');

    tpl = '{% html %}{% pagelet $id="main" %}hello{% pagelet $id="sub" %}world{% endpagelet %}{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: {} }) === '<html><div data-pagelet="main">hello<div data-pagelet="main.sub">world</div></div></html>');

    tpl = '{% html %}{% pagelet $id=main %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { main: 'main' } }) === '<html><div data-pagelet="main">hello</div></html>');

    tpl = '{% html %}{% pagelet $id="main" class="a" %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, {}) === '<html><div class="a" data-pagelet="main">hello</div></html>');

    tpl = '{% html %}{% pagelet $id=\'main\' class=["a", b, c.e] %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { b: 'b', c: { e: 'c.e' } } }) === '<html><div class="a b c.e" data-pagelet="main">hello</div></html>');

    tpl = '{% html %}{% pagelet $id="main" $tag="ul" class=\'a\' %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, {}) === '<html><ul class="a" data-pagelet="main">hello</ul></html>');

    tpl = '{% html %}{% pagelet $id="main" $tag="ul" class="a" %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, {}) === '<html><ul class="a" data-pagelet="main">hello</ul></html>');

    tpl = '{% html %}{% pagelet $id="main" $tag="none" class="a" %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, {}) === '<html><!-- pagelet[main] start -->hello<!-- pagelet[main] end --></html>');

    tpl = '{% html %}{% pagelet $id="main" $tag=\'none\' class="a" %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, {}) === '<html><!-- pagelet[main] start -->hello<!-- pagelet[main] end --></html>');
  });

  it('use pagelet', function() {
    let tpl = '{% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { _pagelets: 'main' } }) === '{"html":{"main":"hello"},"data":{},"js":[],"css":[],"title":"","script":[],"hash":"0000000"}');

    tpl = '{% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { _pagelets: 'x' } }) === '{"html":{"x":""},"data":{},"js":[],"css":[],"title":"","script":[],"hash":"0000000"}');

    tpl = '{% html %}{% pagelet $id="main" %}hello{% pagelet $id="foo" %}world{% endpagelet %}ok{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { _pagelets: 'main' } }) === '{"html":{"main":"hello<div data-pagelet=\\"main.foo\\">world</div>ok"},"data":{},"js":[],"css":[],"title":"","script":[],"hash":"0000000"}');

    tpl = '{% html %}{% pagelet $id="main" %}hello{% pagelet $id="foo" %}world{% endpagelet %}ok{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { _pagelets: 'main.foo' } }) === '{"html":{"main.foo":"world"},"data":{},"js":[],"css":[],"title":"","script":[],"hash":"0000000"}');

    tpl = '{% html %}{% pagelet $id="foo" %}foo{% endpagelet %}{% pagelet $id="bar" %}bar{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { _pagelets: 'foo,bar' } }) === '{"html":{"foo":"foo","bar":"bar"},"data":{},"js":[],"css":[],"title":"","script":[],"hash":"0000000"}');

    tpl = '{% html %}{% pagelet $id="foo" %}foo{% endpagelet %}{% pagelet $id="bar" %}bar{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { _pagelets: 'foo,   bar' } }) === '{"html":{"foo":"foo","bar":"bar"},"data":{},"js":[],"css":[],"title":"","script":[],"hash":"0000000"}');

    tpl = '{% html %}{% pagelet $id="foo" %}foo{% endpagelet %}{% pagelet $id="bar" %}bar{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { _pagelets: 'foo,x' } }) === '{"html":{"foo":"foo","x":""},"data":{},"js":[],"css":[],"title":"","script":[],"hash":"0000000"}');
  });

  it('scripts', function() {
    let tpl = '{% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% script %}world{% endscript %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { _pagelets: 'main' } }) === '{"html":{"main":"hello"},"data":{},"js":[],"css":[],"title":"","script":[],"hash":"0000000"}');

    tpl = '{% html %}{% pagelet $id="main" %}hello{% script %}world{% endscript %}{% endpagelet %}{% endhtml %}';
    assert(swig.render(tpl, { locals: { _pagelets: 'main' } }) === '{"html":{"main":"hello"},"data":{},"js":[],"css":[],"title":"","script":["world"],"hash":"0000000"}');
  });
});
