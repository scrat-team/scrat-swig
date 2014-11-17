var exports = module.exports = require('swig')
;['body', 'head', 'html', 'pagelet', 'require', 'script', 'uri'].forEach(function(tag){
  var t = require('./tags/' + tag);
  swig.setTag(tag, t.parse, t.compile, t.ends, t.blockLevel || false);
})
exports.Resource = require('./lib/resource.js')