var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');
var parser = require('../../lib/parser');

describe('parser', function(){
  var compileFn = function (compiler, args, content, parents, options, blockName) {
      return ';_output += "<div"' + parser.attr(args) + '+">";' + compiler(content, parents, options, blockName) + ';' + '_output += "</div>";';
  };

  swig.setTag('test', parser.parse, compileFn, true,  false);

  var context = {
    locals: {
      clz: 'test',
      foo: {
        bar: 'bar'
      }
    }
  };

  //test cases
  [
      ['class="test"', 'class="test"'],
      ['class=clz', 'class="test"'],
      ['class=foo.bar', 'class="bar"'],
      ['data-attr=clz', 'data-attr="test"'],
      ['data-attr-1-a=clz', 'data-attr-1-a="test"'],
      ['disabled', 'disabled'],
      ['class=["test", clz]', 'class="test test"'],
      ['class=["test"] style=clz', 'class="test" style="test"']
  ].forEach(function(item){
      it('should parse: ' + item[0], function(){
          var c = '{%test ' + item[0] + '%}content{% endtest %}';
          expect(swig.render(c, context)).to.be.equal('<div ' + item[1] + '>content</div>');
      });
  });

  //bad cases
  [
      ['class=', /Invail state on line 1./]
  ].forEach(function(item){
      it('should error: ' + item[0], function(){
          var c = '{%test ' + item[0] + '%}content{% endtest %}';
          expect(function(){
              swig.render(c, context)
          }).to.throwError(item[1]);
      });
  });

});