var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');
var parser = require('../../lib/parser');

describe('Lib: parser', function () {
    var compileFn = function (compiler, args, content, parents, options, blockName) {
        return ';_output += "<div"' + parser.attr(args) + '+">";' + compiler(content, parents, options, blockName) + ';' + '_output += "</div>";';
    };

    swig.setTag('test', parser.parse, compileFn, true, false);

    var context = {
        locals: {
            clz: 'test',
            foo: {
                bar: 'bar'
            },
            html: '<img src=>',
            jsonStr: JSON.stringify({a: 'b'})
        }
    };

    //test cases
    describe('test cases', function () {
        var testCases = [
            ['class="test"', 'class="test"'],
            ['class=clz', 'class="test"'],
            ['class=foo.bar', 'class="bar"'],
            ['data-attr=clz', 'data-attr="test"'],
            ['data-attr-1-a=clz', 'data-attr-1-a="test"'],
            ['disabled', 'disabled'],
            ['class=["test1", clz]', 'class="test1 test"'],
            ['class=["test1"] style=clz', 'class="test1" style="test"'],
            ['class=["test1"] style=clz checked', 'class="test1" style="test" checked']
        ];

        testCases.forEach(function (item) {
            it('should parse: ' + item[0], function () {
                var c = '{%test ' + item[0] + '%}content{% endtest %}';
                expect(swig.render(c, context)).to.be.equal('<div ' + item[1] + '>content</div>');
            });
        });
    });

    //escape cases
    describe('escape cases', function () {
        var testCases = [
            ['class="<"', 'class="&lt;"'],
            ['class=">"', 'class="&gt;"'],
            ['class="&"', 'class="&amp;"'],
            ['class="\'"', 'class="&#39;"'],
            ['class=jsonStr', 'class="{&quot;a&quot;:&quot;b&quot;}"'],
            ['class=html', 'class="&lt;img src=&gt;"']
        ];

        testCases.forEach(function (item) {
            it('should parse: ' + item[0], function () {
                var c = '{%test ' + item[0] + '%}content{% endtest %}';
                expect(swig.render(c, context)).to.be.equal('<div ' + item[1] + '>content</div>');
            });
        });
    });

    //bad cases
    describe('bad cases', function () {
        var badCases = [
            ['class=', /Invalid state.*/i],
            ['class=["test" foo ', /Unexpected token.*/i]
        ];

        badCases.forEach(function (item) {
            it('should error: ' + item[0], function () {
                var c = '{%test ' + item[0] + '%}content{% endtest %}';
                expect(function () {
                    swig.render(c, context);
                }).to.throwError(item[1]);
            });
        });
    });
});