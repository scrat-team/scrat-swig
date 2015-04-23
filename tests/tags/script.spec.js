var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'script';
var tag = require('../../tags/' + tagName);
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags: ' + tagName, function(){
  var resourceInstance = {
    addScript: function(input){
      return input;
    }
  };
  var spy = sinon.spy(resourceInstance, "addScript");

  beforeEach(function(){
    swig.setExtension('_resource', resourceInstance);
  });

  it('addScript', function(){
    expect(swig.render('{% script %}var a = "b";{% endscript %}')).to.equal('');
    sinon.assert.calledWith(spy, 'var a = "b";');
    spy.reset();
  });
});

