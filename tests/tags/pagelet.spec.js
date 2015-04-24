var swig = require('../../index');
var expect = require('expect.js');

describe('Tags: pagelet', function(){
    beforeEach(function(){
        swig.middleware({
            map: {}
        });
    });
    it('tag attribute', function(){
        var tpl = '{% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {})).to.equal('<html><div data-pagelet="main">hello</div></html>');

        tpl = '{% html %}{% pagelet $id=main %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{main: 'main'}})).to.equal('<html><div data-pagelet="main">hello</div></html>');

        tpl = '{% html %}{% pagelet $id="main" class="a" %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {})).to.equal('<html><div class="a" data-pagelet="main">hello</div></html>');

        tpl = '{% html %}{% pagelet $id=\'main\' class=["a", b, c.e] %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{b:'b',c:{e:'c.e'}}})).to.equal('<html><div class="a b c.e" data-pagelet="main">hello</div></html>');

        tpl = '{% html %}{% pagelet $id="main" $tag="ul" class=\'a\' %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {})).to.equal('<html><ul class="a" data-pagelet="main">hello</ul></html>');

        tpl = '{% html %}{% pagelet $id="main" $tag="ul" class="a" %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {})).to.equal('<html><ul class="a" data-pagelet="main">hello</ul></html>');

        tpl = '{% html %}{% pagelet $id="main" $tag="none" class="a" %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {})).to.equal('<html><!-- pagelet[main] start -->hello<!-- pagelet[main] end --></html>');

        tpl = '{% html %}{% pagelet $id="main" $tag=\'none\' class="a" %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {})).to.equal('<html><!-- pagelet[main] start -->hello<!-- pagelet[main] end --></html>');
    });

    it('use pagelet', function(){

        var tpl = '{% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{_pagelets:'main'}})).to.equal('{"html":{"main":"hello"},"data":{},"js":[],"css":[],"title":"","script":[]}');

        tpl = '{% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{_pagelets:'x'}})).to.equal('{"html":{"x":""},"data":{},"js":[],"css":[],"title":"","script":[]}');

        tpl = '{% html %}{% pagelet $id="main" %}hello{% pagelet $id="foo" %}world{% endpagelet %}ok{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{_pagelets:'main'}})).to.equal('{"html":{"main":"hello<div data-pagelet=\\"main.foo\\">world</div>ok"},"data":{},"js":[],"css":[],"title":"","script":[]}');

        tpl = '{% html %}{% pagelet $id="main" %}hello{% pagelet $id="foo" %}world{% endpagelet %}ok{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{_pagelets:'main.foo'}})).to.equal('{"html":{"main.foo":"world"},"data":{},"js":[],"css":[],"title":"","script":[]}');

        tpl = '{% html %}{% pagelet $id="foo" %}foo{% endpagelet %}{% pagelet $id="bar" %}bar{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{_pagelets:'foo,bar'}})).to.equal('{"html":{"foo":"foo","bar":"bar"},"data":{},"js":[],"css":[],"title":"","script":[]}');

        tpl = '{% html %}{% pagelet $id="foo" %}foo{% endpagelet %}{% pagelet $id="bar" %}bar{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{_pagelets:'foo,   bar'}})).to.equal('{"html":{"foo":"foo","bar":"bar"},"data":{},"js":[],"css":[],"title":"","script":[]}');

        tpl = '{% html %}{% pagelet $id="foo" %}foo{% endpagelet %}{% pagelet $id="bar" %}bar{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{_pagelets:'foo,x'}})).to.equal('{"html":{"foo":"foo","x":""},"data":{},"js":[],"css":[],"title":"","script":[]}');
    });

    it('scripts', function(){
        var tpl = '{% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% script %}world{% endscript %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{_pagelets:'main'}})).to.equal('{"html":{"main":"hello"},"data":{},"js":[],"css":[],"title":"","script":[]}');

        tpl = '{% html %}{% pagelet $id="main" %}hello{% script %}world{% endscript %}{% endpagelet %}{% endhtml %}';
        expect(swig.render(tpl, {locals:{_pagelets:'main'}})).to.equal('{"html":{"main":"hello"},"data":{},"js":[],"css":[],"title":"","script":["world"]}');
    });
});