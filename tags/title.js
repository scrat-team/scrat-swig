/**
 * Used to update document.title
 *
 * @example
 * {% title "some-title" %}
 * {% title some_var %}
 * {% title foo["bar"] %}
 * {% title getTitle(pageId) %}
 */

exports.compile = function(compiler, args, content, parents, options, blockName) {
  var code = '';
  if(args.length > 0){
    code = '_output +=' + args.join('');
  }
  return ';_output += "<title>" + _ext._resource.pageletTitle((function(){var _output="";' + code + ';return _output})()) + "</title>";';
};

exports.parse = function(str, line, parser, types) {
  return true;
};

exports.ends = false;