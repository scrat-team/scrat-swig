var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'body';
var tag = require('../../tags/' + tagName);
swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);

describe('Tags: ' + tagName, function(){
  var spy;
  var resourceInstance = {
    'JS_HOOK': '<!-- JS_HOOK_STRING -->'
  };

  beforeEach(function(){
    swig.setExtension('_resource', resourceInstance);
  });

  it('render JSHOOK', function(){
    expect(swig.render('{% body %}<h1>test</h1>{% endbody %}')).to.equal('<body><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('render attr', function(){
    expect(swig.render('{% body diabled %}<h1>test</h1>{% endbody %}')).to.equal('<body diabled><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('render string', function(){
    expect(swig.render('{% body class="test" %}<h1>test</h1>{% endbody %}')).to.equal('<body class="test"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('render var', function(){
    expect(swig.render('{% body class=foo.bar %}<h1>test</h1>{% endbody %}', {locals: {foo: {bar: 'test'}}})).to.equal('<body class="test"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('render all', function(){
    expect(swig.render('{% body diabled class=clz style=foo.bar data-attr="app" checked%}<h1>test</h1>{% endbody %}', {locals: {clz: 'test', foo: {bar: 'test'}}}))
        .to.equal('<body diabled class="test" style="test" data-attr="app" checked><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('render body', function (){
    //expect(swig.render('{% body class="test " + clz data-attr="app" %}<h1>test</h1>{% endbody %}', {locals: {clz: 'test'}})).to.equal('<body class="test"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
    //expect(swig.render('{% body class=["test", clz] data-attr="app" %}<h1>test</h1>{% endbody %}', {locals: {clz: 'test'}})).to.equal('<body class="test"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });
});

