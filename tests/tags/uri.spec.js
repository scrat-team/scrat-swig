var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'uri';
var tag = require('../../tags/' + tagName);
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags: ' + tagName, function(){
  var resourceInstance = {
    uri: function(input){
      return '/public' + input;
    }
  };
  var spy = sinon.spy(resourceInstance, "uri");

  beforeEach(function(){
    swig.setExtension('_resource', resourceInstance);
  });

  it('render uri', function(){
    expect(swig.render('{% uri "/test" %}')).to.equal('/public/test');
    sinon.assert.calledWith(spy, '/test');
    spy.reset();
  });
});

