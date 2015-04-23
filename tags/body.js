/**
 * @alias body
 *
 * @example
 * {% body class=[foo, "ss"] style="test" data-id=foo %} something the page partial {% endbody %}
 */

exports.compile = function (compiler, args, content, parents, options, blockName) {
    var attrs = args.map(function (arg) {
        var code;
        if(arg.val){
            var val = arg.val.length ? '([' + arg.val.join(',') + ']).join(" ")' : arg.val;
            code = '+" ' + arg.key + '=\\"" + ' + val + ' + "\\""';
        } else {
            code = '+" ' + arg.key + '"';
        }
        return code;
    });
    //console.log(attrs);
    var code = [
        '_output += "<body"', attrs.join(''), '+">";',
        compiler(content, parents, options, blockName),
        '_output += _ext._resource.JS_HOOK + "</body>";'
    ];
    //console.log(args);
    //console.log(code.join(''));
    return code.join('');
};

exports.parse = function (str, line, parser, types, stack, opts) {
    // 0 - start: key -> 1, other -> ignore
    // 0.5 '-key': key -> 1, '-' -> 0.5, NUM -> 1, VAR -> 1
    // 1 - collect keys: '-' -> 0.5, '=' -> 2
    // 2 - collect vals: STRING -> 0, VAR -> 0, '[' -> 3
    // 3 - collect vals: STRING -> 4, VAR -> 4, ']' -> 0, '[' -> error
    // 4 - split val: COMMA -> 3, ']' -> 0

    var state = 0, key = '', out = [];
    var error = function(token){
        throw new Error('Unexpected token "' + token.match + '" on line ' + line + '.');
    };
    var push = function(single){
        if(key){
            out.push({
                key: key,
                val: single ? null : this.out
            });
            key = '';
            this.out = [];
        }
    };
    parser.on(types.STRING, function(token){
        switch (state){
            case 2:
                state = 0;
                return true;
            case 3:
                state = 4;
                return true;
            default:
                error(token);
        }
    });
    parser.on(types.NUMBER, function(token){
        switch (state){
            case 0.5:
                key += token.match;
                state = 1;
                break;
            case 2:
                state = 0;
                return true;
            case 3:
                state = 4;
                return true;
            default:
                error(token);
        }
    });
    parser.on(types.VAR, function(token){
        switch (state){
            case 0:
                // PUSH
                push.call(this);
            case 0.5:
                key += token.match;
                state = 1;
                break;
            case 1:
                push.call(this, true);
                key += token.match;
                break;
            case 2:
                state = 0;
                return true;
            case 3:
                state = 4;
                return true;
            default:
                error(token);
        }
    });
    parser.on(types.OPERATOR, function(token){
        switch (state){
            case 1:
            case 0.5:
                if(token.match === '-'){
                    key += '-';
                    state = 0.5;
                } else {
                    error(token);
                }
                break;
            default :
                error(token);
        }
    });
    parser.on(types.ASSIGNMENT, function(token){
        switch (state){
            case 1:
                if(token.match === '='){
                    state = 2;
                } else {
                    error(token);
                }
                break;
            default :
                error(token);
        }
    });
    parser.on(types.BRACKETOPEN, function(token){
        switch (state){
            case 2:
                state = 3;
                break;
            default :
                error(token);
        }
    });
    parser.on(types.BRACKETCLOSE, function(token){
        switch (state){
            case 3:
            case 4:
                state = 0;
                break;
            default :
                error(token);
        }
    });
    parser.on(types.COMMA, function (token) {
        switch (state){
            case 4:
                state = 3;
                break;
            default :
                error(token)
        }
    });
    parser.on('end', function(){
        switch (state){
            case 0:
                push.call(this);
                break;
            case 1:
                push.call(this, true);
                break;
            default :
                throw new Error('Invail state on line ' + line + '.');
        }
        this.out = out;
    });

    return true;
};

exports.ends = true;