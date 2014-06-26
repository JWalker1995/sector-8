require('./js/closure-library/closure/goog/bootstrap/nodejs.js');
require('./public/deps.js');

goog.require('sector8.server');

var server = new sector8.server();
server.run();
