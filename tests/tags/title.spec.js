var swig = require('swig');
var expect = require('expect.js');
var sinon = require('sinon');

var tagName = 'title';
var tag = require('../../tags/' + tagName);

describe('Tags: ' + tagName, function(){
    var spy, context, resourceInstance;

    before(function(){
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
            pageletTitle: function(title){
              return title;
            }
        };
        swig.setExtension('_resource', resourceInstance);
        spy = sinon.spy(resourceInstance, "pageletTitle");
    });

    beforeEach(function(){
        spy.reset();
    });

    it('should render title', function (){
        expect(swig.render('{% title %}bar{% endtitle %}')).to.equal('<title>bar</title>');
        sinon.assert.calledWith(spy, 'bar');
        spy.reset();

        expect(swig.render('{% title %}{{foo.bar}}{% endtitle %}', context)).to.equal('<title>bar</title>');
        sinon.assert.calledWith(spy, 'bar');
        spy.reset();

        expect(swig.render('{% title %}test-{{foo.bar}}{% endtitle %}', context)).to.equal('<title>test-bar</title>');
        sinon.assert.calledWith(spy, 'test-bar');
        spy.reset();
    });
});

