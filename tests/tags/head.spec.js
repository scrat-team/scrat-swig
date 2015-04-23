var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'head';
var tag = require('../../tags/' + tagName);
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags: ' + tagName, function(){
  var spy;
  var resourceInstance = {
    'CSS_HOOK': '<!-- CSS_HOOK_STRING -->'
  };

  beforeEach(function(){
    swig.setExtension('_resource', resourceInstance);
  });

  it('render CSS_HOOK', function(){
    expect(swig.render('{% head %}<meta charset="utf-8"/>{% endhead %}')).to.equal('<head><meta charset="utf-8"/>' + resourceInstance.CSS_HOOK + '</head>');
  });
});

