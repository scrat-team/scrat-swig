var swig = require('../../index');
var expect = require('expect.js');
var path = require('path');
var fs = require('fs');
var tag = 'require';
describe('Tags: ' + tag, function(){
    beforeEach(function(){
        swig.middleware({
            map: {}
        });
    });
    var root = path.resolve(__dirname, '../cases/' + tag);
    var cases = [ 'general' ];
    var load = function(label, callback){
        var locals = {};
        var r = root + '/' + label;
        swig.middleware({
            root: r,
            map: r + '/map.json'
        });
        if(fs.existsSync(r + '/data.json')){
            locals = require(r + '/data.json');
        }
        return {
            file: r + '/test.tpl',
            data: locals,
            expect: fs.readFileSync(r + '/expect.html', 'utf8')
        }
    };
    cases.forEach(function(label){
        it(label, function(){
            var opt = load(label);
            var out = swig.renderFile(opt.file, opt.data);
            expect(out).to.equal(opt.expect);
        });
    });
});