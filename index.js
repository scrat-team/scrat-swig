'use strict';

var swig = require('swig');
var Resource = require('./lib/resource.js');

var tagNames = ['body', 'head', 'html', 'pagelet', 'require', 'script', 'uri', 'title', 'datalet', 'ATF'];

tagNames.forEach(function extendTags(tag) {
  var t = require('./lib/tags/' + tag);
  swig.setTag(tag, t.parse, t.compile, t.ends, t.blockLevel || false);
});

swig.middleware = function createSwigMiddleware(options) {
  var map = options.cacheMap ? Resource.loadOptions(options.map) : options.map;
  swig.setExtension('Resource', Resource);
  swig.setExtension('_map', map);
  Resource.setRoot(options.root || process.cwd());
  if (typeof options.comboURI === 'function') {
    Resource.prototype.comboURI = options.comboURI;
  }
  if (options.logger) {
    Resource.setLogger(options.logger);
  }
  return function swigMiddleware(req, res, next) {
    var pagelets = req.get('X-Pagelets');
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
module.exports = swig;