var swig = require('swig')
;[
  'body', 'head', 'html',
  'pagelet', 'require',
  'script', 'uri', 'title'
].forEach(function(tag){
  var t = require('./tags/' + tag);
  swig.setTag(tag, t.parse, t.compile, t.ends, t.blockLevel || false);
})
swig.Resource = swig.Swig.prototype.Resource = require('./lib/resource.js')
module.exports = swig