var swig = require('../index');

var tpl = '{% html %}{% datalet a[b]="123" %}{{a}} {% endhtml %}';
swig.render(tpl, {b:'c'});