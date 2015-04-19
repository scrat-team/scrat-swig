'use strict'

var swig = require('swig');
var fs = require('fs');
var DEFAULT_COMBO_PATTERN = '/co??%s';
var PREFIX = 'components';
var options = null;
var logger = console;

/**
 * 数字字符串拼接
 * @param arr {Array}
 * @param left {string}
 * @param right {string}
 * @param split {*}
 * @returns {string}
 */
function join(arr, left, right, split) {
    left = left || '';
    right = right || '';
    if (typeof split === 'string') {
        return left + arr.join(split) + right;
    } else {
        return left + arr.join(right + left) + right;
    }
}

/**
 * constructor
 * @param opt {Object|String}
 * @constructor
 */
function Resource(opt) {
    this._collect = {};
    this._script = [];
    this._loaded = {};
    this._pageletsStack = [];
    this._pagelets = {};
    this._datalets = {};
    this._isPageletOpen = false;
    this._usePagelet = false;
    this._title = '';
    options = Resource.loadOptions(opt);
}

Resource.prototype.destroy = function(){
    this._collect = null;
    this._script = null;
    this._loaded = null;
    this._pageletsStack = null;
    this._pagelets = null;
    this._datalets = null;
    this._title = '';
};

/**
 *
 * @param path {String|Object}
 */
Resource.loadOptions = function(path){
    return typeof path === 'object' ? path : JSON.parse(fs.readFileSync(path, 'utf8'));
}

Resource.setLogger = function(l){
    logger = l;
};

/**
 * script标签占位
 * @type {string}
 */
Resource.prototype.JS_HOOK = '<!--SCRAT_JS_HOOK-->';

/**
 * link标签占位
 * @type {string}
 */
Resource.prototype.CSS_HOOK = '<!--SCRAT_CSS_HOOK-->';

/**
 * 收集script代码
 * @param code {string}
 */
Resource.prototype.addScript = function (code) {
    if (this._usePagelet && !this._isPageletOpen) return
    this._script.push(code)
}

/**
 * 处理uri
 * @param uri {string}
 * @returns {string}
 */
Resource.prototype.comboURI = function (uri) {
    return uri.replace(/^\/public\//g, '');
}

/**
 * 根据id获取资源
 * @param id {string}
 */
Resource.prototype.getResById = function (id) {
    if (options) {
        if (options.res) {
            if (options.res.hasOwnProperty(id)) {
                return options.res[id]
            } else {
                //TODO
            }
        } else {
            logger.error('missing resource map');
        }
    } else {
        logger.error('missing resource map');
    }
}

Resource.prototype.normalize = function (id, ext) {
    ext = ext || '';
    if(id.indexOf('.') === -1){
        id += '/' + id.substring(id.lastIndexOf('/') + 1) + ext;
    }
    return id.replace(/^(?!(views|components)\/)/, PREFIX + '/');
}

/**
 * 收集资源
 * @param id {string}
 * @return {object}
 */
Resource.prototype.require = function (id) {
    if (this._usePagelet && !this._isPageletOpen) return true;
    var rId = this.normalize(id + '.js');
    if (this._loaded.hasOwnProperty(rId)) return true;
    var res = this.getResById(rId);
    if(!res){
        rId = this.normalize(id + '.css');
        if (this._loaded.hasOwnProperty(rId)) return true;
        res = this.getResById(rId);
    }
    if (res) {
        this._loaded[rId] = true
        if (res.deps && res.deps.length) {
            res.deps.forEach(this.require.bind(this))
        }
        if (!this._collect[res.type]) {
            this._collect[res.type] = []
        }
        this._collect[res.type].push(res.uri)
        return true;
    } else {
        return false;
    }
}

/**
 * 加载组件
 * @param file {string}
 * @param options {object}
 * @param ctx {object}
 */
Resource.prototype.include = function (file, options, ctx) {
    var id = file, html = '', got = false;
    if (file.indexOf('.') === -1) {
        file = this.normalize(file, '.tpl');
        var res = this.getResById(file);
        if (res) {
            got = true;
            id = file;
            html = swig.compileFile(res.uri, options)(ctx);
        }
    }
    got = this.require(id) || got;
    if(!got){
        logger.error('unable to load resource [' + id + ']');
    }
    return html
}

/**
 * 根据id获取资源uri
 * @param id {string}
 */
Resource.prototype.uri = function (id) {
    var res = this.getResById(id)
    if (res) {
        return res.uri
    }
}

/**
 *
 * @param collect {Array}
 */
Resource.prototype.makeComboURI = function (collect) {
    var url = this.getComboPattern()
    var self = this, combo = ''
    collect.forEach(function (uri) {
        combo += ',' + self.comboURI(uri)
    })
    return url.replace('%s', combo.substring(1))
}

Resource.prototype.getComboPattern = function () {
    return options.comboPattern || DEFAULT_COMBO_PATTERN
}

/**
 *
 * @returns {string}
 */
Resource.prototype.renderJs = function () {
    var html = ''
    var used = []
    if (this._collect.js && this._collect.js.length) {
        var left = '<script src="'
        var right = '"></script>\n'
        if (options.combo) {
            html += left + this.makeComboURI(this._collect.js) + right
        } else {
            html += join(this._collect.js, left, right)
        }
        used = this._collect.js
    }
    if (this._collect.css && this._collect.css.length) {
        used = used.concat(this._collect.css)
    }
    if (options.combo && used.length) {
        for (var i = 0, len = used.length; i < len; i++) {
            used[i] = this.comboURI(used[i]);
        }
    }
    var code = 'pagelet.init(' + (options.combo ? 1 : 0) + ',"' + this.getComboPattern() + '",["' + used.join('","') + '"]);';
    html += '<script>' + code + '</script>\n';
    if (this._script.length) {
        if (options.combo) {
            html += '<script>' + join(this._script, '!function(){', '}();') + '</script>\n'
        } else {
            html += join(this._script, '<script>' + '!function(){', '}();</script>\n')
        }
    }
    return html
}

/**
 *
 * @returns {string}
 */
Resource.prototype.renderCss = function () {
    var html = ''
    if (this._collect.css && this._collect.css.length) {
        var left = '<link rel="stylesheet" href="'
        var right = '">\n'
        if (options.combo) {
            html += left + this.makeComboURI(this._collect.css) + right
        } else {
            html += join(this._collect.css, left, right)
        }
    }
    return html
}

/**
 *
 * @param out {string}
 * @returns {string}
 */
Resource.prototype.render = function (out) {
    if (this._usePagelet) {
        var js = this._collect.js || []
        var css = this._collect.css || []
        var self = this
        if (options.combo && js.length) {
            js.forEach(function (uri, index) {
                js[index] = self.comboURI(uri)
            })
        }
        if (options.combo && css.length) {
            css.forEach(function (uri, index) {
                css[index] = self.comboURI(uri)
            })
        }
        out = JSON.stringify({
            html: this._pagelets,
            data: this._datalets,
            js: js,
            css: css,
            title: this._title,
            script: this._script
        })
    } else {
        var p = out.indexOf(this.CSS_HOOK);
        if (p > -1) {
            out = out.substring(0, p) + this.renderCss() + out.substring(p + this.CSS_HOOK.length);
        }
        p = out.lastIndexOf(this.JS_HOOK);
        if (p > -1) {
            out = out.substring(0, p) + this.renderJs() + out.substring(p + this.JS_HOOK.length);
        }
    }
    this.destroy();
    return out;
}

/**
 *
 * @param ids {string}
 */
Resource.prototype.usePagelet = function (ids) {
    if (ids) {
        this._usePagelet = true;
        var self = this;
        ids.split(/\s*,\s*/).forEach(function (id) {
            self._pagelets[id] = '';
        });
    }
}

/**
 *
 * @param id {string}
 * @returns {string}
 */
Resource.prototype.pageletId = function(id){
    var arr = [];
    this._pageletsStack.forEach(function(item){
        arr.push(item.id);
    });
    arr.push(id);
    return arr.join('.');
};

var PAGELET_NO_MATCH = 0;
var PAGELET_PATH_MATCH = 1;
var PAGELET_ABS_MATCH = 2;
var PAGELET_IN_ABS_MATCH = 3;

Resource.prototype.pageletCheck = function(id){
    for(var path in this._pagelets){
        if(id === path){
            return PAGELET_ABS_MATCH;
        } else if(path.indexOf(id + '.') === 0){
            return PAGELET_PATH_MATCH;
        }
    }
    return PAGELET_NO_MATCH;
};

/**
 *
 * @param id
 * @returns {boolean}
 */
Resource.prototype.pageletStart = function (id) {
    var fullId = this.pageletId(id);
    var ret = PAGELET_NO_MATCH;
    var stack = this._pageletsStack;
    if(this._usePagelet){
        var parent = stack[stack.length - 1];
        if(parent && (parent.state === PAGELET_ABS_MATCH || parent.state === PAGELET_IN_ABS_MATCH)){
            ret = PAGELET_IN_ABS_MATCH;
        } else {
            ret = this.pageletCheck(fullId);
        }
    } else {
        ret = PAGELET_IN_ABS_MATCH;
    }
    if(ret){
        if(ret === PAGELET_ABS_MATCH){
            this._isPageletOpen = true;
        }
        this._pageletsStack.push({
            id: id,
            fullId: fullId,
            state: ret
        });
    }
    return ret;
}

/**
 *
 * @param id {string}
 * @param html {string}
 * @returns {string}
 */
Resource.prototype.pageletEnd = function (html) {
    var last = this._pageletsStack.pop();
    if(last.state === PAGELET_ABS_MATCH){
        this._pagelets[last.fullId] = html;
        this._isPageletOpen = false;
    }
    return html;
}

/**
 *
 * @param title {string}
 * @returns {string}
 */
Resource.prototype.pageletTitle = function (title) {
    if (this._usePagelet) {
        this._title = title;
    }
    return title;
}

module.exports = Resource;