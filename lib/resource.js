'use strict'

var swig = require('swig')
var fs = require('fs')
var DEFAULT_COMBO_PATTERN = '/co??%s'
var PREFIX = 'components'

/**
 * 数字字符串拼接
 * @param arr {Array}
 * @param left {string}
 * @param right {string}
 * @param split {*}
 * @returns {string}
 */
function join(arr, left, right, split) {
  left = left || ''
  right = right || ''
  if (typeof split === 'string') {
    return left + arr.join(split) + right
  } else {
    return left + arr.join(right + left) + right
  }
}

/**
 * constructor
 * @param path {string} map file path
 * @constructor
 */
function Resource(path){
  this._collect = {}
  this._script = []
  this._loaded = {}
  this._pagelets = {}
  this._isPageletOpen = false
  this._usePagelet = false
  this._title = ''
  if(path){
    this.loadOptions(path)
  }
}

/**
 * script标签占位
 * @type {string}
 */
Resource.prototype.JS_HOOK = '<!--SCRAT_JS_HOOK-->'

/**
 * link标签占位
 * @type {string}
 */
Resource.prototype.CSS_HOOK = '<!--SCRAT_CSS_HOOK-->'

/**
 *
 * @param path {string}
 */
Resource.prototype.loadOptions = function(path){
  var options
  if(typeof path === 'object'){
    options = path
  } else {
    var content = fs.readFileSync(path)
    options = JSON.parse(content)
  }
  this.setOptions(options)
}

/**
 * 各种参数
 * @param options {object}
 */
Resource.prototype.setOptions = function(options){
  this.map = options
  this.combo = options.combo
  this.comboPattern = options.comboPattern
}

/**
 * 收集script代码
 * @param code {string}
 */
Resource.prototype.addScript = function(code){
  if(this._usePagelet && !this._isPageletOpen) return
  this._script.push(code)
}

/**
 * 处理uri
 * @param uri {string}
 * @returns {string}
 */
Resource.prototype.comboURI = function(uri){
  return uri
}

/**
 * 根据id获取资源
 * @param id {string}
 */
Resource.prototype.getResById = function(id){
  if(this.map){
    if(this.map.res){
      if(this.map.res.hasOwnProperty(id)){
        return this.map.res[id]
      } else {
        // TODO warning
      }
    } else {
      // TODO error
    }
  } else {
    // TODO error
  }
}

Resource.prototype.normalize = function(id, ext){
  ext = ext || ''
  if(id.indexOf('.') === -1){
    id += '/' + id.split('/').pop() + ext
  }
  return id.replace(/^(?!(views|components)\/)/, PREFIX + '/')
}

/**
 * 收集资源
 * @param id {string}
 * @return {object}
 */
Resource.prototype.require = function(id){
  if(this._usePagelet && !this._isPageletOpen) return
  id = this.normalize(id, '.js')
  if(this._loaded.hasOwnProperty(id)) return
  var res = this.getResById(id)
  if(res){
    this._loaded[id] = true
    if(res.deps && res.deps.length){
      res.deps.forEach(this.require.bind(this))
    }
    if(!this._collect[res.type]){
      this._collect[res.type] = []
    }
    this._collect[res.type].push(res.uri)
    return res
  }
}

/**
 * 加载组件
 * @param file {string}
 * @param options {object}
 * @param ctx {object}
 */
Resource.prototype.include = function(file, options, ctx){
  var id = file, html = ''
  if(file.indexOf('.') === -1){
    file = this.normalize(file, '.tpl')
    var res = this.getResById(file)
    if(res){
      id = file;
      html = swig.compileFile(res.uri, options)(ctx)
    }
  }
  this.require(id)
  return html
}

/**
 * 根据id获取资源uri
 * @param id {string}
 */
Resource.prototype.uri = function(id){
  var res = this.getResById(id)
  if(res){
    return res.uri
  }
}

/**
 *
 * @param collect {Array}
 */
Resource.prototype.makeComboURI = function(collect){
  var url = this.getComboPattern()
  var self = this, combo = ''
  collect.forEach(function(uri){
    combo += ',' + self.comboURI(uri)
  })
  return url.replace('%s', combo.substring(1))
}

Resource.prototype.getComboPattern = function(){
  return this.comboPattern || DEFAULT_COMBO_PATTERN
}

/**
 *
 * @returns {string}
 */
Resource.prototype.renderJs = function(){
  var html = ''
  var used = []
  if(this._collect.js && this._collect.js.length){
    var left = '<script src="'
    var right = '"></script>\n'
    if(this.combo){
      html += left + this.makeComboURI(this._collect.js) + right
    } else {
      html += join(this._collect.js, left, right)
    }
    used = this._collect.js
  }
  if(this._collect.css && this._collect.css.length) {
    used = used.concat(this._collect.css)
  }
  if(this.combo && used.length){
    for(var i = 0, len = used.length; i < len; i++){
      used[i] = this.comboURI(used[i]);
    }
  }
  var code = 'pagelet.init(' + (this.combo ? 1 : 0) + ',"' + this.getComboPattern() + '",["' + used.join('","') + '"]);';
  html += '<script>' + code + '</script>\n';
  if(this._script.length){
    if(this.combo){
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
Resource.prototype.renderCss = function(){
  var html = ''
  if(this._collect.css && this._collect.css.length){
    var left = '<link rel="stylesheet" href="'
    var right = '">\n'
    if(this.combo){
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
Resource.prototype.render = function(out){
  if(this._usePagelet){
    var js = this._collect.js || []
    var css = this._collect.css || []
    var self = this
    if(this.combo && js.length){
      js.forEach(function(uri, index){
        js[index] = self.comboURI(uri)
      })
    }
    if(this.combo && css.length){
      css.forEach(function(uri, index){
        css[index] = self.comboURI(uri)
      })
    }
    out = JSON.stringify({
      html  : this._pagelets,
      js    : js,
      css   : css,
      title : this._title,
      script: this._script
    })
  } else {
    var p = out.indexOf(this.CSS_HOOK)
    if(p > -1){
      out = out.substring(0, p) + this.renderCss() + out.substring(p + this.CSS_HOOK.length)
    }
    p = out.lastIndexOf(this.JS_HOOK)
    if(p > -1){
      out = out.substring(0, p) + this.renderJs() + out.substring(p + this.JS_HOOK.length)
    }
  }
  return out
}

/**
 *
 * @param ids {string}
 */
Resource.prototype.pagelet = function(ids){
  if(ids) {
    this._usePagelet = true
    var self = this
    ids.split(/\s*,\s*/).forEach(function(id){
      self._pagelets[id] = '';
    });
  }
}

/**
 *
 * @param id
 * @returns {boolean}
 */
Resource.prototype.pageletStart = function(id){
  return this._isPageletOpen || !this._usePagelet || (this._isPageletOpen = this._pagelets.hasOwnProperty(id))
}

/**
 *
 * @param id {string}
 * @param html {string}
 * @returns {string}
 */
Resource.prototype.pageletEnd = function(id, html){
  if(this._isPageletOpen){
    this._pagelets[id] = html
    this._isPageletOpen = false
  }
  return html
}

/**
 *
 * @param title {string}
 * @returns {string}
 */
Resource.prototype.pageletTitle = function(title){
  if(this._usePagelet){
    this._title = title
  }
  return title
}

module.exports = Resource