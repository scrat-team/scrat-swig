var swig = require('swig');
var Resource = require('../../lib/resource');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'html';
var tag = require('../../tags/' + tagName);
var JS_HOOK = Resource.prototype.JS_HOOK;
var CSS_HOOK = Resource.prototype.CSS_HOOK;
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags: ' + tagName, function(){

    beforeEach(function(){
        swig.setExtension('Resource', Resource);
        swig.setExtension('_map', {});
    });

    it('remove JSHOOK', function(){
        expect(swig.render('{% html %}<h1>test'+JS_HOOK+'</h1>{% endhtml %}')).to.equal('<html><h1>test<script>pagelet.init(0,"/co??%s",[""]);</script>\n</h1></html>');
        expect(swig.render('{% html %}<h1>'+JS_HOOK+'test'+JS_HOOK+'</h1>{% endhtml %}')).to.equal('<html><h1>'+JS_HOOK+'test<script>pagelet.init(0,"/co??%s",[""]);</script>\n</h1></html>');
    });

    it('remove CSSHOOK', function(){
        expect(swig.render('{% html %}<h1>test'+CSS_HOOK+'</h1>{% endhtml %}')).to.equal('<html><h1>test</h1></html>');
        expect(swig.render('{% html %}<h1>'+CSS_HOOK+'test'+CSS_HOOK+'</h1>{% endhtml %}')).to.equal('<html><h1>test'+CSS_HOOK+'</h1></html>');
    });

    it('render attr', function(){
        expect(swig.render('{% html disabled %}<h1>test</h1>{% endhtml %}')).to.equal('<html disabled><h1>test</h1></html>');
        expect(swig.render('{% html disa-bled %}<h1>test</h1>{% endhtml %}')).to.equal('<html disa-bled><h1>test</h1></html>');
        expect(swig.render('{% html disa--bled %}<h1>test</h1>{% endhtml %}')).to.equal('<html disa--bled><h1>test</h1></html>');
    });

    it('render string', function(){
        expect(swig.render('{% html class--3-a-a-a0="test" %}<h1>test</h1>{% endhtml %}')).to.equal('<html class--3-a-a-a0="test"><h1>test</h1></html>');
    });

    it('render var', function(){
        expect(swig.render('{% html class=foo.bar %}<h1>test</h1>{% endhtml %}', {locals: {foo: {bar: 'test'}}})).to.equal('<html class="test"><h1>test</h1></html>');
        expect(swig.render('{% html class=foo.bar1 %}<h1>test</h1>{% endhtml %}', {locals: {foo: {bar: 'test'}}})).to.equal('<html class=""><h1>test</h1></html>');
    });

    it('render all', function(){
        expect(swig.render('{% html disabled class=clz style=foo.bar data-attr="app" checked%}<h1>test</h1>{% endhtml %}', {locals: {clz: 'test', foo: {bar: 'test'}}}))
            .to.equal('<html disabled class="test" style="test" data-attr="app" checked><h1>test</h1></html>');
    });

    it('render multi', function (){
        expect(swig.render('{% html class=["test1", clz] style="test" %}<h1>test</h1>{% endhtml%}', {locals: {clz: 'test'}}))
            .to.equal('<html class="test1 test" style="test"><h1>test</h1></html>');

        expect(swig.render('{% html class=[foo.bar, "test1"] %}<h1>test</h1>{% endhtml%}', {locals: {clz: 'test', foo: {bar: 'test'}}}))
            .to.equal('<html class="test test1"><h1>test</h1></html>');

        expect(swig.render('{% html class=["test1"] %}<h1>test</h1>{% endhtml%}', {locals: {clz: 'test'}}))
            .to.equal('<html class="test1"><h1>test</h1></html>');

        expect(swig.render('{% html class=[clz] %}<h1>test</h1>{% endhtml%}', {locals: {clz: 'test'}}))
            .to.equal('<html class="test"><h1>test</h1></html>');

        expect(swig.render('{% html class=[a]%}<h1>test</h1>{% endhtml%}', {locals: {clz: 'test'}}))
            .to.equal('<html class=""><h1>test</h1></html>');
    });
    it('error', function(){
        expect(function(){
            swig.render('{% html class=["test1", clz %}<h1>test</h1>{% endhtml%}', {locals: {clz: 'test'}})
        }).to.throwError(/Invail state on line 1\./);
    })
});

