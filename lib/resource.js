'use strict'

var swig = require('swig')
var fs = require('fs')

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
  this.comboPattern = options.comboPattern || '/co??'
}

/**
 * 收集script代码
 * @param code {string}
 */
Resource.prototype.addScript = function(code){
  this._script.push(code)
}

/**
 * 处理uri
 * @param uri {string}
 * @returns {string}
 */
Resource.prototype.processURI = function(uri){
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

/**
 * 收集资源
 * @param id {string}
 * @return {object}
 */
Resource.prototype.require = function(id){
  if(this._loaded.hasOwnProperty(id)) return
  if(this._usePagelet && !this._isPageletOpen) return
  var res = this.getResById(id)
  if(res){
    this._loaded[id] = true
    if(res.deps && res.deps.length){
      res.deps.forEach(this.require.bind(this))
    }
    if(!this._collect[res.type]){
      this._collect[res.type] = []
    }
    this._collect[res.type].push(this.processURI(res.uri))
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
  var id = file
  var html = ''
  if(file.indexOf('.') === -1){
    var last = file.split('/').pop()
    var exts = [ 'tpl', 'js', 'coffee', 'css', 'styl', 'sass', 'scss' ]
    file = 'components/' + file + '/' + last
    for(var i = 0, len = exts.length; i < len; i++){
      var ext = exts[i]
      id = file + '.' + ext
      var res = this.getResById(id)
      if(res){
        if(ext === 'tpl'){
          html = swig.compileFile(res.uri, options)(ctx)
        }
        break
      }
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
 * @returns {string}
 */
Resource.prototype.renderJs = function(){
  var html = ''
  if(this._collect.js && this._collect.js.length){
    var left = '<script src="' + this.comboPattern
    var right = '"></script>\n'
    var split = this.combo ? ',' : false
    html += join(this._collect.js, left, right, split)
  }
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
    var left = '<link rel="stylesheet" href="' + this.comboPattern
    var right = '">\n'
    var split = this.combo ? ',' : false
    html += join(this._collect.css, left, right, split)
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
    out = JSON.stringify({
      html  : this._pagelets,
      js    : this._collect.js,
      css   : this._collect.css,
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

module.exports = Resource