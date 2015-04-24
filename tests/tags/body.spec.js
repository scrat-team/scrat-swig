var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'body';
var tag = require('../../tags/' + tagName);

describe('Tags: ' + tagName, function () {
    var spy, context, resourceInstance;

    before(function () {
        swig.setTag(tagName, tag.parse, tag.compile, tag.ends, tag.blockLevel || false);
        context = {
            locals: {
                clz: 'test',
                foo: {
                    bar: 'bar'
                }
            }
        };
        resourceInstance = {
            'JS_HOOK': '<!--SCRAT_JS_HOOK-->',
            'CSS_HOOK': '<!--SCRAT_CSS_HOOK-->'
        };
        swig.setExtension('_resource', resourceInstance);
    });

    it('should render JS_HOOK', function () {
        expect(swig.render('{% body %}<h1>test</h1>{% endbody %}')).to.equal('<body><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
    });

    it('should render attr', function () {
        expect(swig.render('{% body class=["test1", clz] style="test" data-src=foo.bar data-test%}<h1>test</h1>{% endbody%}', context))
                .to.equal('<body class="test1 test" style="test" data-src="bar" data-test><h1>test</h1>' + resourceInstance.JS_HOOK + '</body>');
    });
});

