/**
 * render pagelet tag
 *
 * @alias pagelet
 *
 * @example
 * {% html %}{% pagelet $id="main" %}hello{% endpagelet %}{% endhtml %}
 * {% html %}{% pagelet $id="main" $tag="section %}hello{% endpagelet %}{% endhtml %}
 */
'use strict';
const parser = require('../parser');
exports.compile = function pageletCompile(compiler, args, content, parents, options, blockName) {
  let tag = '"div"';
  let id = '';
  /* eslint-disable array-callback-return */
  const attrs = args.map(function(arg) {
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
    let code = '';
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
  }
  throw new Error('missing pagelet $id.');

};
exports.parse = parser.parse('$id');
exports.ends = true;
