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
    expect(swig.render('{% body disabled %}<h1>test</h1>{% endbody %}')).to.equal('<body disabled><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
    expect(swig.render('{% body disa-bled %}<h1>test</h1>{% endbody %}')).to.equal('<body disa-bled><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
    expect(swig.render('{% body disa--bled %}<h1>test</h1>{% endbody %}')).to.equal('<body disa--bled><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('render string', function(){
    expect(swig.render('{% body class-3-a-a-a0="test" %}<h1>test</h1>{% endbody %}')).to.equal('<body class-3-a-a-a0="test"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('render var', function(){
    expect(swig.render('{% body class=foo.bar %}<h1>test</h1>{% endbody %}', {locals: {foo: {bar: 'test'}}})).to.equal('<body class="test"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
    expect(swig.render('{% body class=foo.bar1 %}<h1>test</h1>{% endbody %}', {locals: {foo: {bar: 'test'}}})).to.equal('<body class=""><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('render all', function(){
    expect(swig.render('{% body disabled class=clz style=foo.bar data-attr="app" checked%}<h1>test</h1>{% endbody %}', {locals: {clz: 'test', foo: {bar: 'test'}}}))
        .to.equal('<body disabled class="test" style="test" data-attr="app" checked><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });

  it('render multi', function (){
    expect(swig.render('{% body class=["test1", clz] style="test" %}<h1>test</h1>{% endbody%}', {locals: {clz: 'test'}}))
      .to.equal('<body class="test1 test" style="test"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');

    expect(swig.render('{% body class=[foo.bar, "test1"] %}<h1>test</h1>{% endbody%}', {locals: {clz: 'test', foo: {bar: 'test'}}}))
      .to.equal('<body class="test test1"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');

    expect(swig.render('{% body class=["test1"] %}<h1>test</h1>{% endbody%}', {locals: {clz: 'test'}}))
        .to.equal('<body class="test1"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');

    expect(swig.render('{% body class=[clz] %}<h1>test</h1>{% endbody%}', {locals: {clz: 'test'}}))
        .to.equal('<body class="test"><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');

    expect(swig.render('{% body class=[a]%}<h1>test</h1>{% endbody%}', {locals: {clz: 'test'}}))
        .to.equal('<body class=""><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
  });
  it('error', function(){
      expect(function(){
          swig.render('{% body class=["test1", clz %}<h1>test</h1>{% endbody%}', {locals: {clz: 'test'}})
      }).to.throwError(/Invail state on line 1\./);
  })
});

