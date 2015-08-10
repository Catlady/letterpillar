// Set relative path from here to each server file
var server = require('./server/server');
var router = require('./server/router');
var requestHandlers = require('./server/requesthandlers');
var functions = require('./server/functions');

var handle = {};
handle['/'] = requestHandlers.static;
handle['/static'] = requestHandlers.static;
handle['/favicon.ico'] = requestHandlers.favicon;
handle["/functions"] = functions.functions;

console.log('about to start server');
server.start(router.route, handle);

/*Free hosting
https://www.appfog.com/
https://console.appfog.com/

redirected from snakesandletters.com
https://theconsole.netregistry.com.au
*/