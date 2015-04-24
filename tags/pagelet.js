/**
 * render pagelet tag
 *
 * @alias pagelet
 *
 * @example
 * {% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% endhtml %}
 * {% html %}{% pagelet $id="main" $tag="section %}hello{% endpagelet %}{% endhtml %}
 */

var parser = require('../lib/parser');
exports.compile = function (compiler, args, content, parents, options, blockName) {
    var tag = '"div"';
    var id = '';
    var attrs = args.map(function (arg) {
        if (arg.key === '$id') {
            id = arg.val;
        } else if (arg.key === '$tag') {
            if (/^['"]none['"]$/i.test(arg.val)) {
                tag = false;
            } else {
                tag = arg.val;
            }
        } else {
            return parser.genAttr(arg.key, arg.val);
        }
    }).join('');

    if (id) {
        var code = '';
        if (tag) {
            code += ';_output+="<"+' + tag + attrs + '+" data-pagelet=\\""+_ext._resource.pageletId(' + id + ')+"\\">";';
        } else {
            code += ';_output+="<!-- pagelet["+_ext._resource.pageletId(' + id + ')+"] start -->";';
        }
        code += 'if(_ext._resource.pageletStart(' + id + ')){' +
                '_output+=_ext._resource.pageletEnd((function(){var _output="";' +
                compiler(content, parents, options, blockName) +
                ';return _output})());}';
        if (tag) {
            code += '_output+="</"+' + tag + '+">";';
        } else {
            code += '_output+="<!-- pagelet[" + _ext._resource.pageletId(' + id + ') + "] end -->";';
        }
        return code;
    } else {
        throw new Error('missing pagelet $id.');
    }
};
exports.parse = parser.parse('$id');
exports.ends = true;