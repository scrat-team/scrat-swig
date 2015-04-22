var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'title';
var tag = require('../../tags/' + tagName);
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags:', function () {
  describe(tagName, function(){
    var resourceInstance = {
      pageletTitle: function(title){
        return title;
      }
    };
    var spy = sinon.spy(resourceInstance, "pageletTitle");

    beforeEach(function(){
      spy.reset();
      swig.setExtension('_resource', resourceInstance);
    });

    it('render title', function (){
      expect(swig.render('{% title "bar"%}')).to.equal('<title>bar</title>');
      sinon.assert.calledWith(spy, 'bar');
      spy.reset();

      expect(swig.render('{% title foo %}', {locals: {foo: "bar"}})).to.equal('<title>bar</title>');
      sinon.assert.calledWith(spy, 'bar');
      spy.reset();
    });

    it('render empty', function(){
      expect(swig.render('{% title %}', {locals: {title: 'bar'}})).to.equal('<title>bar</title>');
      sinon.assert.calledWith(spy, 'bar');
      spy.reset();

      expect(swig.render('{% title %}')).to.equal('<title></title>');
      spy.reset();
    });

    it('render fn', function(){
      expect(swig.render('{% title foo.key + foo["key"] + foo[v]%}', {locals: {v: "key", foo: {"key": "bar"}}})).to.equal('<title>barbarbar</title>');
      sinon.assert.calledWith(spy, 'barbarbar');
      spy.reset();

      expect(swig.render('{% title fn(foo) %}', {locals: {fn: function(o){ return o.key}, foo: {"key": "bar"}}})).to.equal('<title>bar</title>');
      sinon.assert.calledWith(spy, 'bar');
      spy.reset();
    });

    it('render escape', function(){
      expect(swig.render("{% title 'bar'%}")).to.equal('<title>bar</title>');
      sinon.assert.calledWith(spy, 'bar');
      spy.reset();

      expect(swig.render('{% title \'"bar"\'%}')).to.equal('<title>"bar"</title>');
      sinon.assert.calledWith(spy, '"bar"');
      spy.reset();

      expect(swig.render('{% title "I\'m title"%}')).to.equal('<title>I\'m title</title>');
      sinon.assert.calledWith(spy, 'I\'m title');
      spy.reset();
    });
  });
});
