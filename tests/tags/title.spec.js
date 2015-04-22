var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'title';
var tag = require('../../tags/' + tagName);
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags:', function () {
  describe(tagName, function(){
    var spy;
    var resourceInstance = {
      pageletTitle: function(title){
        return title;
      }
    };

    beforeEach(function(){
      spy = sinon.spy(resourceInstance, "pageletTitle");
      swig.setExtension('_resource', resourceInstance);
    });

    it.only('render title', function (){
      expect(swig.render('{% title "bar"%}')).to.equal('<title>bar</title>');
      sinon.assert.calledWith(spy, 'bar');
      spy.reset();

      expect(swig.render('{% title %}', {locals: {title: 'bar'}})).to.equal('<title>bar</title>');
      sinon.assert.calledWith(spy, 'bar');
      spy.reset();

      expect(swig.render('{% title %}')).to.equal('<title></title>');
      spy.reset();

      expect(swig.render('{% title foo %}', {locals: {foo: "bar"}})).to.equal('<title>bar</title>');
      sinon.assert.calledWith(spy, 'bar');
      spy.reset();

      expect(swig.render('{% title foo.key + foo["key"] + foo[v]%}', {locals: {v: "key", foo: {"key": "bar"}}})).to.equal('<title>barbarbar</title>');
      sinon.assert.calledWith(spy, 'barbarbar');
      spy.reset();

      expect(swig.render('{% title fn(foo) %}', {locals: {fn: function(o){ return o.key}, foo: {"key": "bar"}}})).to.equal('<title>bar</title>');
      sinon.assert.calledWith(spy, 'bar');
      spy.reset();
    });
  });
});
