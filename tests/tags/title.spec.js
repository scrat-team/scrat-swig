var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'title';
var tag = require('../../tags/' + tagName);
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags: ' + tagName, function(){
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
    expect(swig.render('{% title %}bar{% endtitle %}')).to.equal('<title>bar</title>');
    sinon.assert.calledWith(spy, 'bar');
    spy.reset();

    expect(swig.render('{% title %}{{foo}}{% endtitle %}', {locals: {foo: "bar"}})).to.equal('<title>bar</title>');
    sinon.assert.calledWith(spy, 'bar');
    spy.reset();

    expect(swig.render('{% title %}test-{{foo}}{% endtitle %}', {locals: {foo: "bar"}})).to.equal('<title>test-bar</title>');
    sinon.assert.calledWith(spy, 'test-bar');
    spy.reset();
  });
});

