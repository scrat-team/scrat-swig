'use strict';

const fs = require('fs');
const DEFAULT_COMBO_PATTERN = '/co??%s';
const DEFAULT_COMBO_MAX_LENGTH = Number.POSITIVE_INFINITY; // 正无穷
const PREFIX = 'component';
const cache = {};
let options = null;
let logger = console;
let root = '';
let domain = '';
// auto include service-worker registration script when enable PWA mode.
let serviceWorkerRegistrationJS = '';

/**
 * 数字字符串拼接
 * @param {Array} arr 需合并的数组
 * @param {string} left 数据头
 * @param {string} right 数据尾
 * @param {*} split 合并的中间字符
 * @return {string} 拼接后的数据
 */
function join(arr, left, right, split) {
  const leftVal = left || '';
  const rightVal = right || '';
  if (typeof split === 'string') {
    return leftVal + arr.join(split) + rightVal;
  }
  return leftVal + arr.join(right + leftVal) + rightVal;

}

function Resource(opt) {
  this._collect = {};
  this._collectATF = {};
  this._includeCss = []; // css tag的扩展
  this._includeCssATF = []; // css tag的扩展
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

Resource.loadOptions = function(path) {
  return typeof path === 'object' ? path : JSON.parse(fs.readFileSync(path, 'utf8'));
};

// 单元测试模式下，同一个进程时会加载很多次不同的map，但实际上正常的项目只会有一个map
Resource.cleanOptions = function() {
  options = null;
};

Resource.setLogger = function(instance) {
  logger = instance;
};

Resource.setRoot = function(path) {
  const rootPath = path.replace(/\/((views|view)?\/?)?$/, ''); // historical problems
  if (rootPath) {
    root = rootPath;
  }
};

Resource.setServiceWorkerRegistrationJS = js => {
  serviceWorkerRegistrationJS = js;
};

// 运行时动态设置combo开关
// Resource.setCombo = combo => {
//   options.combo = combo;
// };

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
 * 收集 script 代码
 * @param {String} code 散落的 JS 代码
 * @return {void}
 */
Resource.prototype.addScript = function(code) {
  if (this._usePagelet && !this._isPageletOpen) return;
  this._script.push(code);
};

/**
 * 处理 uri
 * @param {String} uri 需处理的URL
 * @return {String} 转换后的URL
 */
Resource.prototype.comboURI = function(uri) {
  return uri.replace(/^\/public\//g, '');
};

/**
 * 根据 id 获取资源
 * @param {String} id 资源ID
 * @return {Object} 资源信息
 */
Resource.prototype.getResById = function(id) {
  if (options) {
    if (options.res) {
      if (options.res.hasOwnProperty(id)) {
        return options.res[id];
      }
        // TODO

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
  let result = id;
  if (id.indexOf('.') === -1) {
    result += '/' + id.substring(id.lastIndexOf('/') + 1) + (ext || '');
  }
  return result.replace(/^(?!((views|view)?|(components|component))\/)/, PREFIX + '/');
};

/**
 * 处理uri，当在运行时从combo模式切换到非combo模式下，替换静态资源serving地址，默认是和主应用同域名
 * @param {Array} collect 资源集合
 * @param {String} uri 资源uri
 */
function pushUri(collect, uri) {
  // const escapeRegExp = function(string) {
  //   return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // };
  // const stripKeys = Object.keys(options.stripPrefixMulti || {});

  // if (!options.combo && stripKeys.length) {
  //   uri = uri.replace(
  //     new RegExp('^(' + stripKeys.map(escapeRegExp).join('|') + ')'),
  //     function(m) { return options.stripPrefixMulti[m]; }
  //   );
  // }

  collect.push(uri);
}

/**
 * 收集资源
 * @param {String} id 资源ID
 * @return {Boolean} // TODO: 含义?
 */
Resource.prototype.require = function(id) {
  if (this._usePagelet && !this._isPageletOpen) return true;
  let rId = this.normalize(id, '.js');
  if (this._loaded.hasOwnProperty(rId)) return true;
  let res = this.getResById(rId);
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
    let _collect;
    if (this._useATF && res.type === 'css') {
      _collect = this._collectATF;
    } else {
      _collect = this._collect;
    }
    if (!_collect[res.type]) {
      _collect[res.type] = [];
    }
    pushUri(_collect[res.type], res.uri);
    return true;
  }
  return false;

};

/**
 * 加载组件
 * @param {String} file 引入的文件路径
 * @param {Object} ctx 数据
 * @param {Function} swig 渲染函数, 用来渲染子模板
 * @return {String} 引入的文件的 HTML
 */
Resource.prototype.include = function(file, ctx, swig) {
  let id = file;
  let html = '';
  let got = false;
  if (file.indexOf('.') === -1) {
    file = this.normalize(file, '.tpl');
    const res = this.getResById(file);
    if (res) {
      got = true;
      id = file;
      const opt = {};
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
 * 运行时动态加载css
 * @param {String} file 引入的文件路径
 * @example:
 * {% if nation == "russia" %}
 *   {% css $id="widget/article/content.russia.css" %}
 * {% endif %}
 * @return {String} 样式地址
 */
Resource.prototype.includeCSS = function(file) {
  const hasExt = /\.css$/.test(file);
  const normalizeFile = this.normalize(hasExt ? file : file + '.css', '.css');
  const res = this.getResById(normalizeFile);

  if (res) {
    const collect = this._useATF ? this._includeCssATF : this._includeCss;

    pushUri(collect, res.uri);
  } else {
    logger.error('unable to load resource [' + file + ']');
  }

  return '';
};

/**
 * 根据 id 获取资源的URI
 * @param {String} id 资源ID
 * @return {String} 资源URI
 */
Resource.prototype.uri = function(id) {
  const res = this.getResById(id);
  if (res) {
    return res.uri;
  }
};

Resource.prototype.genComboURI = function(collect, urlLength) {
  const url = this.getComboPattern();
  const len = typeof (urlLength) !== 'undefined' ? urlLength : DEFAULT_COMBO_MAX_LENGTH; // best length 1920 = 1024 + 512 + 256 + 128
  const output = [];
  let combo = '';
  let temp;
  collect.forEach(function(uri) {
    temp = ',' + this.comboURI(uri);

    if (!combo.length || [ combo, temp ].join('').length <= len) {
      combo += temp;
    } else {
      output.push(url.replace('%s', combo.substring(1)));
      combo = temp;
    }
  }, this);
  output.push(url.replace('%s', combo.substring(1)));

  return output;
};

// fixbug
Resource.prototype.getComboPattern = function() {
  const comboPattern = options.comboPattern || DEFAULT_COMBO_PATTERN;

  return /^(https?:|)\/\//.test(comboPattern) ? comboPattern : domain + comboPattern;

  // return domain + (options.comboPattern || DEFAULT_COMBO_PATTERN);
};

Resource.prototype._replace = function(str, from, to, b2f) {
  if (b2f) {
    const p = str.lastIndexOf(from);
    if (p !== -1) {
      str = str.substring(0, p) + to + str.substring(p + from.length);
    }
  } else {
    str = str.replace(from, to);
  }
  return str;
};

Resource.prototype.renderJs = function() {
  let html = '';
  let used = [];
  if (this._collect.js && this._collect.js.length) {
    const left = '<script src="';
    const right = '"></script>\n';
    if (options.combo) {
      const pack = this.genComboURI(this._collect.js, options.comboMaxLen);
      pack.forEach(function(res) {
        html += left + res + right;
      });
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
    for (let i = 0, len = used.length; i < len; i++) {
      used[i] = this.comboURI(used[i]);
    }
  }

  const args = [
    options.combo ? 1 : 0,
    '"' + this.getComboPattern() + '"',
    '["' + used.join('","') + '"]',
    '"' + (options.hash ? options.hash : '0000000') + '"',
  ];
  const code = 'pagelet&&pagelet.init&&pagelet.init(' + args.join(',') + ');';

  html += '<script>' + code + '</script>\n';

  if (this._script.length) {
    if (options.combo) {
      html += '<script>' + join(this._script, '!function(){', '}();') + '</script>\n';
    } else {
      html += join(this._script, '<script>!function(){', '}();</script>\n');
    }
  }

  // 在<body>最后面插入service-worker register脚本
  if (options.usePWA && serviceWorkerRegistrationJS) {
    html += `<script id="sw-register">${serviceWorkerRegistrationJS}</script>`;
  }

  return html;
};

Resource.prototype.genLinkTag = function(collect, defer) {
  let html = '';
  if (collect && collect.length) {
    const left = '<link rel="stylesheet" href="';
    const right = '"' + (defer ? ' data-defer' : '') + '>\n';
    if (options.combo) {
      const pack = this.genComboURI(collect, options.comboMaxLen);
      pack.forEach(function(res) {
        html += left + res + right;
      });
    } else {
      html += join(collect, left, right);
    }
  }
  return html;
};

Resource.prototype.renderCss = function() {
  const collect = (this._collect.css || []).concat(this._includeCss);
  return this.genLinkTag(collect);
};

Resource.prototype.renderATFCss = function() {
  let html = '';
  const _collect = this._collect.css;
  const collect = _collect && _collect.length ?
    _collect.concat(this._includeCss) : this._includeCss;

  if (collect && collect.length) {
    let fn;
    if (options.combo) {
      fn = function(uri) {
        let content = '';
        if (cache.hasOwnProperty(uri)) {
          content = cache[uri];
        } else {
          let path;
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

    // collect.forEach(fn);

    for (let i = 0; i < collect.length;) fn(collect[i++]);

    if (options.combo) {
      html = '<style>' + html + '</style>';
    }
  }
  return html;
};

Resource.prototype.renderBTFCss = function() {
  const _collect = this._collectATF.css || [];
  const collect = _collect.concat(this._includeCssATF);
  let html = this.genLinkTag(collect, true);

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

Resource.prototype.render = function(out) {
  if (this._usePagelet) {
    const js = this._collect.js || [];
    let css = this._collect.css || [];
    const self = this;

    // 把动态加载的css添加到队列末尾，保证它们可以覆盖之前的样式
    css = css.concat(this._useATF ? this._includeCssATF : this._includeCss);

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
      js,
      css,
      title: this._title,
      script: this._script,
      hash: options.hash || '0000000',
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

Resource.prototype.usePagelet = function(ids) {
  if (ids) {
    this._usePagelet = true;
    ids.split(/\s*,\s*/).forEach(function(id) {
      this._pagelets[id] = '';
    }, this);
  }
};

Resource.prototype.pageletId = function(id) {
  const arr = [];
  this._pageletsStack.forEach(function(item) {
    arr.push(item.id);
  });
  arr.push(id);
  return arr.join('.');
};

const PAGELET_NO_MATCH = 0;
const PAGELET_PATH_MATCH = 1;
const PAGELET_ABS_MATCH = 2;
const PAGELET_IN_ABS_MATCH = 3;

Resource.prototype.pageletCheck = function(id) {
  for (const path in this._pagelets) {
    if (id === path) {
      return PAGELET_ABS_MATCH;
    } else if (path.indexOf(id + '.') === 0) {
      return PAGELET_PATH_MATCH;
    }
  }
  return PAGELET_NO_MATCH;
};

Resource.prototype.pageletStart = function(id) {
  const fullId = this.pageletId(id);
  let ret = PAGELET_NO_MATCH;
  const stack = this._pageletsStack;
  if (this._usePagelet) {
    const parent = stack[stack.length - 1];
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
      id,
      fullId,
      state: ret,
    });
  }
  return ret;
};

Resource.prototype.pageletEnd = function(html) {
  const last = this._pageletsStack.pop();
  if (last.state === PAGELET_ABS_MATCH) {
    this._pagelets[last.fullId] = html;
    this._isPageletOpen = false;
  }
  return html;
};

Resource.prototype.pageletTitle = function(title) {
  if (this._usePagelet) {
    this._title = title;
  }
  return title;
};

Resource.prototype.useATF = function() {
  let html = '';
  if (!this._usePagelet) {
    this._useATF = true;
    html = this.ATF_HOOK;
  }
  return html;
};

module.exports = Resource;
