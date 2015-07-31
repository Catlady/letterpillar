// Set relative path from here to each server file
var server = require('./server/server');
var router = require('./server/router');
var requestHandlers = require('./server/requesthandlers');

// TODO AMW make it not case sensitive
var handle = {};
handle['/'] = requestHandlers.static;
handle['/static'] = requestHandlers.static;
handle['/favicon.ico'] = requestHandlers.favicon;

console.log('about to start server');
server.start(router.route, handle);