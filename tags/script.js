/**
 * collect script
 *
 * @alias script
 *
 * @example
 * {% script %}var a = "b";{% endscript %}
 */

exports.compile = function (compiler, args, content, parents, options, blockName) {
    return ';_ext._resource.addScript((function(){var _output="";' +
            compiler(content, parents, options, blockName) +
            ';return _output; })());';
};

exports.parse = function () {
    return true;
};

exports.ends = true;