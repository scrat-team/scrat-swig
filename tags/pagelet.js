exports.compile = function (compiler, args, content, parents, options, blockName) {
    var tag = 'div';
    var id = '';
    var attrs = [];
    args.forEach(function (arg) {
        if(arg.key === '$id'){
            id = arg.value;
        } else if(arg.key === '$tag') {
            tag = arg.value.substring(1, arg.value.length - 1);
            if(/^none$/i.test(tag)){
                tag = false;
            }
        } else {
            attrs.push(arg.key + '=' + arg.value);
        }
    });
    if(id){
        var code = compiler(content, parents, options, blockName);
        var ret = [];
        if(tag){
            attrs = attrs.length ? ' ' + attrs.join(' ').replace(/["\\]/g, '\\$&') : '';
            ret.push('_output += "<' + tag + attrs + ' data-pagelet=\\"" + _ext._resource.pageletId(' + id + ') + "\\">";');
        } else {
            ret.push('_output += "<!-- pagelet[" + _ext._resource.pageletId(' + id + ') + "] start -->";');
        }
        ret.push('if(_ext._resource.pageletStart(' + id + ')){');
        ret.push('_output += _ext._resource.pageletEnd((function(){var _output="";' + code + ';return _output})());');
        ret.push('}');
        if(tag){
            ret.push('_output += "</' + tag + '>";');
        } else {
            ret.push('_output += "<!-- pagelet[" + _ext._resource.pageletId(' + id + ') + "] end -->";');
        }
        ret = ret.join('');
        //console.log(ret);
        return ret;
    } else {
        throw new Error('missing pagelet $id.');
    }
};

exports.parse = function (str, line, parser, types, stack, opts) {
    var assign = false, key = '';
    parser.on(types.STRING, function (token) {
        if(assign && key){
            this.out.push({
                key: key,
                value: token.match
            });
            assign = false;
            key = '';
        } else {
            throw new Error('Unexpected string "' + token.match + '" on line ' + line + '.');
        }
    });
    parser.on(types.ASSIGNMENT, function (token) {
        if(token.match === '=' && key){
            assign = true;
        } else {
            throw new Error('Unexpected assignment "' + token.match + '" on line ' + line + '.');
        }
    });

    parser.on(types.OPERATOR, function (token) {
        var val = token.match;
        if (val === '-' && key) {
            key += val;
        }
    });
    parser.on(types.VAR, function (token) {
        key += token.match;
        return false;
    });
    return true;
};

exports.ends = true;