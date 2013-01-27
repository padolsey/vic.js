global.vic = require('../src/vic').vic;
var twtl = require('./twtl');
global.test = twtl.test;
global.expect = twtl.expect;
require('./test');
