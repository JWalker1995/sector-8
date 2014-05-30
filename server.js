require('./js/closure-library/closure/goog/bootstrap/nodejs');
require('./js/deps.js');

goog.require('sector8.core');
goog.require('sector8.server');

var core = new sector8.core();
var server = new sector8.server(core);
server.run();
