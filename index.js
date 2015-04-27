var swig = require('swig');
[
    'body', 'head', 'html', 'pagelet', 'require',
    'script', 'uri', 'title', 'datalet'
].forEach(function(tag){
    var t = require('./tags/' + tag);
    swig.setTag(tag, t.parse, t.compile, t.ends, t.blockLevel || false);
});
var Resource = require('./lib/resource.js');
swig.middleware = function(options){
    swig.setExtension('Resource', Resource);
    var map = options.cacheMap ? Resource.loadOptions(options.map) : options.map;
    swig.setExtension('_map', map);
    Resource.setRoot(options.root || process.cwd());
    if(typeof options.comboURI === 'function'){
        Resource.prototype.comboURI = options.comboURI;
    }
    if(options.logger){
        Resource.setLogger(options.logger);
    }
    return function(req, res, next){
        res.locals._query = req.query;
        res.locals._body = req.body;
        var pagelets = req.get('X-Pagelets');
        if(pagelets){
            res.set('Content-Type', 'application/json');
            //res.set('Cache-Control', 'no-cache, no-store');
            //res.set('Pragma', 'no-cache');
            //res.set('Expires', 0);
            res.locals._pagelets = pagelets;
        }
        next();
    };
};
module.exports = swig;