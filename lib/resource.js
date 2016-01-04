'use strict';

var swig = require('swig');
var fs = require('fs');
var DEFAULT_COMBO_PATTERN = '/co??%s';
var PREFIX = 'components';
var options = null;
var logger = console;
var root = '';
var domain = '';
var cache = {};

/**
 * 数字字符串拼接
 * @param arr {Array}
 * @param left {string}
 * @param right {string}
 * @param [split] {*}
 * @returns {string}
 */
function join(arr, left, right, split) {
  var leftVal = left || '';
  var rightVal = right || '';
  if (typeof split === 'string') {
    return leftVal + arr.join(split) + rightVal;
  } else {
    return leftVal + arr.join(right + leftVal) + rightVal;
  }
}

/**
 * constructor
 * @param opt {Object|String}
 * @constructor
 */
function Resource(opt) {
  this._collect = {};
  this._collectATF = {};
  this._script = [];
  this._loaded = {};
  this._pageletsStack = [];
  this._pagelets = {};
  this._datalets = {};
  this._isPageletOpen = false;
  this._usePagelet = false;
  this._title = '';
  this._useATF = false;
  options = Resource.loadOptions(opt);
}

Resource.prototype.destroy = function() {
  this._collect = null;
  this._collectATF = null;
  this._script = null;
  this._loaded = null;
  this._pageletsStack = null;
  this._pagelets = null;
  this._datalets = null;
  this._title = '';
  this._useATF = false;
};

/**
 *
 * @param path {String|Object}
 */
Resource.loadOptions = function(path) {
  return typeof path === 'object' ? path : JSON.parse(fs.readFileSync(path, 'utf8'));
};

Resource.setLogger = function(instance) {
  logger = instance;
};

Resource.setRoot = function(path) {
  var rootPath = path.replace(/\/(views\/?)?$/, ''); // historical problems
  if (rootPath) {
    root = rootPath;
  }
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
 * 首屏分隔占位
 * @type {string}
 */
Resource.prototype.ATF_HOOK = '<!--SCRAT_ATF_HOOK-->';

/**
 * 收集script代码
 * @param code {string}
 */
Resource.prototype.addScript = function(code) {
  if (this._usePagelet && !this._isPageletOpen) return;
  this._script.push(code);
};

/**
 * 处理uri
 * @param uri {string}
 * @returns {string}
 */
Resource.prototype.comboURI = function(uri) {
  return uri.replace(/^\/public\//g, '');
};

/**
 * 根据id获取资源
 * @param id {string}
 */
Resource.prototype.getResById = function(id) {
  if (options) {
    if (options.res) {
      if (options.res.hasOwnProperty(id)) {
        return options.res[id];
      } else {
        // TODO
      }
    } else {
      logger.error('missing resource map');
    }
  } else {
    logger.error('missing resource map');
  }
};

Resource.prototype.setDomain = function(d) {
  if ((typeof d === 'string') && d.length) {
    domain = d.replace(/\/$/, '');
  }
};

Resource.prototype.normalize = function(id, ext) {
  var result = id;
  if (id.indexOf('.') === -1) {
    result += '/' + id.substring(id.lastIndexOf('/') + 1) + (ext || '');
  }
  return result.replace(/^(?!(views|components)\/)/, PREFIX + '/');
};

/**
 * 收集资源
 * @param id {string}
 * @return {object}
 */
Resource.prototype.require = function(id) {
  if (this._usePagelet && !this._isPageletOpen) return true;
  var rId = this.normalize(id, '.js');
  if (this._loaded.hasOwnProperty(rId)) return true;
  var res = this.getResById(rId);
  if (!res) {
    rId = this.normalize(id, '.css');
    if (this._loaded.hasOwnProperty(rId)) return true;
    res = this.getResById(rId);
  }
  if (res) {
    this._loaded[rId] = true;
    if (res.deps && res.deps.length) {
      res.deps.forEach(this.require.bind(this));
    }
    var _collect;
    if (this._useATF && res.type === 'css') {
      _collect = this._collectATF;
    } else {
      _collect = this._collect;
    }
    if (!_collect[res.type]) {
      _collect[res.type] = [];
    }
    _collect[res.type].push(res.uri);
    return true;
  } else {
    return false;
  }
};

/**
 * 加载组件
 * @param file {string}
 * @param ctx {object}
 */
Resource.prototype.include = function(file, ctx) {
  var id = file;
  var html = '';
  var got = false;
  if (file.indexOf('.') === -1) {
    file = this.normalize(file, '.tpl');
    var res = this.getResById(file);
    if (res) {
      got = true;
      id = file;
      var opt = {};
      if (root) {
        opt.resolveFrom = root + '/index.tpl';
      }
      html = swig.compileFile(res.uri, opt)(ctx);
    }
  }
  got = this.require(id) || got;
  if (!got) {
    logger.error('unable to load resource [' + id + ']');
  }
  return html;
};

/**
 * 根据id获取资源uri
 * @param id {string}
 */
Resource.prototype.uri = function(id) {
  var res = this.getResById(id);
  if (res) {
    return res.uri;
  }
};

/**
 *
 * @param collect {Array}
 */
Resource.prototype.genComboURI = function(collect) {
  var url = this.getComboPattern();
  var combo = '';
  collect.forEach(function(uri) {
    combo += ',' + this.comboURI(uri);
  }, this);
  return url.replace('%s', combo.substring(1));
};

/**
 *
 * @returns {string}
 */
Resource.prototype.getComboPattern = function() {
  return domain + (options.comboPattern || DEFAULT_COMBO_PATTERN);
};

/**
 *
 * @param str {string}
 * @param from {string}
 * @param to {string}
 * @param b2f {boolean}
 * @private
 */
Resource.prototype._replace = function(str, from, to, b2f) {
  if (b2f) {
    var p = str.lastIndexOf(from);
    if (p !== -1) {
      str = str.substring(0, p) + to + str.substring(p + from.length);
    }
  } else {
    str = str.replace(from, to);
  }
  return str;
};

/**
 *
 * @returns {string}
 */
Resource.prototype.renderJs = function() {
  var html = '';
  var used = [];
  if (this._collect.js && this._collect.js.length) {
    var left = '<script src="';
    var right = '"></script>\n';
    if (options.combo) {
      html += left + this.genComboURI(this._collect.js) + right;
    } else {
      html += join(this._collect.js, left, right);
    }
    used = this._collect.js;
  }
  if (this._collect.css && this._collect.css.length) {
    used = used.concat(this._collect.css);
  }
  if (this._collectATF.css && this._collectATF.css.length) {
    used = used.concat(this._collectATF.css);
  }
  if (options.combo && used.length) {
    for (var i = 0, len = used.length; i < len; i++) {
      used[i] = this.comboURI(used[i]);
    }
  }
  var args = [
    options.combo ? 1 : 0,
    '"' + this.getComboPattern() + '"',
    '["' + used.join('","') + '"]',
    '"' + (options.hash ? options.hash : '0000000') + '"'
  ];
  var code = 'pagelet.init(' + args.join(',') + ');';
  html += '<script>' + code + '</script>\n';
  if (this._script.length) {
    if (options.combo) {
      html += '<script>' + join(this._script, '!function(){', '}();') + '</script>\n';
    } else {
      html += join(this._script, '<script>' + '!function(){', '}();</script>\n');
    }
  }
  return html;
};

Resource.prototype.genLinkTag = function(collect, defer) {
  var html = '';
  if (collect && collect.length) {
    var left = '<link rel="stylesheet" href="';
    var right = '"' + (defer ? ' data-defer' : '') + '>\n';
    if (options.combo) {
      html += left + this.genComboURI(collect) + right;
    } else {
      html += join(collect, left, right);
    }
  }
  return html;
};

/**
 * @returns {string}
 */
Resource.prototype.renderCss = function() {
  return this.genLinkTag(this._collect.css);
};

/**
 *
 * @returns {string}
 */
Resource.prototype.renderATFCss = function() {
  var html = '';
  if (this._collect.css && this._collect.css.length) {
    var fn;
    if (options.combo) {
      fn = function(uri) {
        var content = '';
        if (cache.hasOwnProperty(uri)) {
          content = cache[uri];
        } else {
          var path;
          if (uri[0] === '/') {
            path = root + uri;
          } else {
            path = root + '/' + uri;
          }
          try {
            content = fs.readFileSync(path);
            cache[uri] = content;
          } catch (e) {
            logger.error('unable inline file [' + path + ']');
          }
        }
        html += content + '\n';
      };
    } else {
      fn = function(uri) {
        html += '<link rel="stylesheet" href="' + uri + '">\n';
      };
    }
    this._collect.css.forEach(fn);
    if (options.combo) {
      html = '<style>' + html + '</style>';
    }
  }
  return html;
};

/**
 *
 * @returns {string}
 */
Resource.prototype.renderBTFCss = function() {
  var html = this.genLinkTag(this._collectATF.css, true);
  if (html) {
    html += '<script>(function(d,l,h,i,n,e){' +
        'l=d.getElementsByTagName("link");' +
        'h=d.head||d.getElementsByTagName("head")[0];' +
        'for(i=0,n=l.length;i<n;i++){' +
          'e=l[i];' +
          'if(e.hasAttribute("data-defer"))' +
          'h.appendChild(e);' +
        '}' +
        '})(document);</script>';
  }
  return html;
};

/**
 *
 * @param out {string}
 * @returns {string}
 */
Resource.prototype.render = function(out) {
  if (this._usePagelet) {
    var js = this._collect.js || [];
    var css = this._collect.css || [];
    var self = this;
    if (options.combo && js.length) {
      js.forEach(function(uri, index) {
        js[index] = self.comboURI(uri);
      });
    }
    if (options.combo && css.length) {
      css.forEach(function(uri, index) {
        css[index] = self.comboURI(uri);
      });
    }
    out = JSON.stringify({
      html: this._pagelets,
      data: this._datalets,
      js: js,
      css: css,
      title: this._title,
      script: this._script,
      hash: options.hash || '0000000'
    });
  } else {
    if (this._useATF) {
      out = this._replace(out, this.CSS_HOOK, this.renderATFCss());
      out = this._replace(out, this.ATF_HOOK, this.renderBTFCss());
    } else {
      out = this._replace(out, this.CSS_HOOK, this.renderCss());
    }
    out = this._replace(out, this.JS_HOOK, this.renderJs(), true);
  }
  this.destroy();
  return out;
};

/**
 *
 * @param ids {string}
 */
Resource.prototype.usePagelet = function(ids) {
  if (ids) {
    this._usePagelet = true;
    ids.split(/\s*,\s*/).forEach(function(id) {
      this._pagelets[id] = '';
    }, this);
  }
};

/**
 *
 * @param id {string}
 * @returns {string}
 */
Resource.prototype.pageletId = function(id) {
  var arr = [];
  this._pageletsStack.forEach(function(item) {
    arr.push(item.id);
  });
  arr.push(id);
  return arr.join('.');
};

var PAGELET_NO_MATCH = 0;
var PAGELET_PATH_MATCH = 1;
var PAGELET_ABS_MATCH = 2;
var PAGELET_IN_ABS_MATCH = 3;

Resource.prototype.pageletCheck = function(id) {
  for (var path in this._pagelets) {
    if (id === path) {
      return PAGELET_ABS_MATCH;
    } else if (path.indexOf(id + '.') === 0) {
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
Resource.prototype.pageletStart = function(id) {
  var fullId = this.pageletId(id);
  var ret = PAGELET_NO_MATCH;
  var stack = this._pageletsStack;
  if (this._usePagelet) {
    var parent = stack[stack.length - 1];
    if (parent && (parent.state === PAGELET_ABS_MATCH || parent.state === PAGELET_IN_ABS_MATCH)) {
      ret = PAGELET_IN_ABS_MATCH;
    } else {
      ret = this.pageletCheck(fullId);
    }
  } else {
    ret = PAGELET_IN_ABS_MATCH;
  }
  if (ret) {
    if (ret === PAGELET_ABS_MATCH) {
      this._isPageletOpen = true;
    }
    this._pageletsStack.push({
      id: id,
      fullId: fullId,
      state: ret
    });
  }
  return ret;
};

/**
 * @param html {string}
 * @returns {string}
 */
Resource.prototype.pageletEnd = function(html) {
  var last = this._pageletsStack.pop();
  if (last.state === PAGELET_ABS_MATCH) {
    this._pagelets[last.fullId] = html;
    this._isPageletOpen = false;
  }
  return html;
};

/**
 *
 * @param title {string}
 * @returns {string}
 */
Resource.prototype.pageletTitle = function(title) {
  if (this._usePagelet) {
    this._title = title;
  }
  return title;
};

/**
 *
 * @returns {string}
 */
Resource.prototype.useATF = function() {
  var html = '';
  if (!this._usePagelet) {
    this._useATF = true;
    html = this.ATF_HOOK;
  }
  return html;
};

module.exports = Resource;