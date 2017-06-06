'use strict';

let swig = require('swig');
const filters = require('swig/lib/filters');
const Resource = require('./lib/resource.js');

const tagNames = [ 'body', 'head', 'html', 'pagelet', 'require', 'css', 'script', 'uri', 'title', 'datalet', 'ATF' ];

module.exports = exports = swig;
exports.tagNames = tagNames;
exports.Resource = Resource;
exports.filters = exports.filters || filters;

exports.configure = function(options) {
  swig = options.swig || swig;
  options.swig = undefined;
  tagNames.forEach(function extendTags(tag) {
    const t = require('./lib/tags/' + tag);
    swig.setTag(tag, t.parse, t.compile, t.ends, t.blockLevel || false);
  });
  const map = options.cacheMap ? Resource.loadOptions(options.map) : options.map;
  swig.setExtension('Resource', Resource);
  swig.setExtension('_map', map);
  Resource.setRoot(options.root || process.cwd());
  if (typeof options.comboURI === 'function') {
    Resource.prototype.comboURI = options.comboURI;
  }
  if (options.logger) {
    Resource.setLogger(options.logger);
  }
};

exports.middleware = function createSwigMiddleware(options) {
  this.configure(options);
  return function swigMiddleware(req, res, next) {
    const pagelets = req.get('X-Pagelets');
    res.locals._query = req.query;
    res.locals._body = req.body;
    if (pagelets) {
      res.set('Content-Type', 'application/json');
      // res.set('Cache-Control', 'no-cache, no-store');
      // res.set('Pragma', 'no-cache');
      // res.set('Expires', 0);
      res.locals._pagelets = pagelets;
    }
    next();
  };
};
