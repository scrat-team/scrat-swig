'use strict';

const swig = require('swig');
const assert = require('assert');
const parser = require('../../lib/parser');

describe('Lib: parser', function() {
  const compileFn = function(compiler, args, content, parents, options, blockName) {
    return ';_output += "<div"' + parser.attr(args) + '+">";' + compiler(content, parents, options, blockName) + ';_output += "</div>";';
  };

  swig.setTag('test', parser.parse(), compileFn, true, false);

  const context = {
    locals: {
      clz: 'test',
      foo: {
        bar: 'bar',
      },
      bool: false,
      html: '<img src=>',
      jsonStr: JSON.stringify({ a: 'b' }),
    },
  };

  // test cases
  describe('test cases', function() {
    const testCases = [
      [ 'class=true', 'class=true' ],
      [ 'class=bool', 'class=false' ],
      [ 'class="test"', 'class="test"' ],
      [ 'class=clz', 'class="test"' ],
      [ 'class=foo.bar', 'class="bar"' ],
      [ 'data-attr=clz', 'data-attr="test"' ],
      [ 'data-attr-1-a=clz', 'data-attr-1-a="test"' ],
      [ 'disabled', 'disabled' ],
      [ 'class=["test1", clz]', 'class="test1 test"' ],
      [ 'class=["test1", clz, false, bool]', 'class="test1 test false false"' ],
      [ 'class=["test1"] style=clz', 'class="test1" style="test"' ],
      [ 'class=["test1"] style=clz checked', 'class="test1" style="test" checked' ],
    ];

    testCases.forEach(function(item) {
      it('should parse: ' + item[0], function() {
        const c = '{%test ' + item[0] + '%}content{% endtest %}';
        assert(swig.render(c, context) === '<div ' + item[1] + '>content</div>');
      });
    });
  });

  // escape cases
  describe('escape cases', function() {
    const testCases = [
      [ 'class="<"', 'class="&lt;"' ],
      [ 'class=">"', 'class="&gt;"' ],
      [ 'class="&"', 'class="&amp;"' ],
      [ 'class="\'"', 'class="&#39;"' ],
      [ 'class=jsonStr', 'class="{&quot;a&quot;:&quot;b&quot;}"' ],
      [ 'class=html', 'class="&lt;img src=&gt;"' ],
    ];

    testCases.forEach(function(item) {
      it('should parse: ' + item[0], function() {
        const c = '{%test ' + item[0] + '%}content{% endtest %}';
        assert(swig.render(c, context) === '<div ' + item[1] + '>content</div>');
      });
    });
  });

  // bad cases
  describe('bad cases', function() {
    const badCases = [
      [ 'class=', /Invalid lexical end.*/i ],
      [ 'class=["test" foo ', /Unexpected token.*/i ],
    ];

    badCases.forEach(function(item) {
      it('should error: ' + item[0], function() {
        const c = '{%test ' + item[0] + '%}content{% endtest %}';
        assert.throws(() => swig.render(c, context), item[1]);
      });
    });
  });
});
